import 'dart:async';
import 'dart:math';
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/user_model.dart';
import '../models/food_item.dart';
import '../models/coupon.dart';
import '../models/address.dart';
import '../models/order.dart';
import '../models/cart_item.dart';
import '../mock/mock_database.dart';


String generateFirebaseUid() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  final random = Random();
  return List.generate(28, (index) => chars[random.nextInt(chars.length)]).join();
}

class AuthRepository {
  static const String _dbUrl = 'https://dineos-123-default-rtdb.asia-southeast1.firebasedatabase.app';

  Future<Map<String, Map<String, dynamic>>> _fetchRemoteUsers() async {
    try {
      final response = await http.get(Uri.parse('$_dbUrl/user_customer.json')).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        if (decoded is Map) {
          final result = <String, Map<String, dynamic>>{};
          decoded.forEach((key, val) {
            if (val is Map) {
              result[key.toString()] = Map<String, dynamic>.from(val);
            }
          });
          // Sync to local mock database
          MockDatabase.userCustomerTable.clear();
          MockDatabase.userCustomerTable.addAll(result);
          return result;
        }
      }
    } catch (e) {
      // Print error for debug and fall back
      print('Error fetching users from Firebase RTDB: $e');
    }
    return MockDatabase.userCustomerTable;
  }

  Future<UserModel> login(String email, String password) async {
    if (email.isEmpty || password.isEmpty) {
      throw Exception('Email and password are required');
    }

    final users = await _fetchRemoteUsers();
    String? foundUserId;
    Map<String, dynamic>? foundUserRecord;

    users.forEach((key, val) {
      if (val['email'] == email && val['password'] == password) {
        foundUserId = key;
        foundUserRecord = val;
      }
    });

    if (foundUserId != null && foundUserRecord != null) {
      return UserModel(
        id: foundUserId!,
        fullName: foundUserRecord!['fullName'] ?? '',
        mobileNumber: foundUserRecord!['mobileNumber'] ?? '',
        username: foundUserRecord!['username'] ?? '',
        email: foundUserRecord!['email'] ?? '',
        password: foundUserRecord!['password'] ?? '',
      );
    }

    // Fallback: Default mock user if logging in with customer@dineos.com / password123
    if (email == 'customer@dineos.com' && password == 'password123') {
      final defaultId = 'IjrrNmUtrlSP2qskK47DcCLNZSI22';
      final record = {
        'fullName': 'Oliver Queen',
        'mobileNumber': '+919876543210',
        'username': 'oliverqueen',
        'email': 'customer@dineos.com',
        'password': 'password123',
      };
      
      try {
        await http.put(
          Uri.parse('$_dbUrl/user_customer/$defaultId.json'),
          body: json.encode(record),
        ).timeout(const Duration(seconds: 3));
      } catch (e) {
        print('Failed to write seed user to database: $e');
      }

      MockDatabase.userCustomerTable[defaultId] = record;
      return UserModel(
        id: defaultId,
        fullName: 'Oliver Queen',
        mobileNumber: '+919876543210',
        username: 'oliverqueen',
        email: 'customer@dineos.com',
        password: 'password123',
      );
    }

    throw Exception('Invalid email or password');
  }

  Future<UserModel> signup({
    required String fullName,
    required String mobileNumber,
    required String username,
    required String email,
    required String password,
  }) async {
    final users = await _fetchRemoteUsers();

    // Check duplicates
    bool emailExists = false;
    bool usernameExists = false;
    users.forEach((key, val) {
      if (val['email'] == email) emailExists = true;
      if (val['username'] == username) usernameExists = true;
    });

    if (emailExists) {
      throw Exception('Email address is already registered');
    }
    if (usernameExists) {
      throw Exception('Username is already taken');
    }

    final String userId = generateFirebaseUid();
    final formattedMobile = mobileNumber.startsWith('+91') ? mobileNumber : '+91$mobileNumber';

    final record = {
      'fullName': fullName,
      'mobileNumber': formattedMobile,
      'username': username,
      'email': email,
      'password': password,
    };

    try {
      final response = await http.put(
        Uri.parse('$_dbUrl/user_customer/$userId.json'),
        body: json.encode(record),
      ).timeout(const Duration(seconds: 5));
      if (response.statusCode != 200 && response.statusCode != 201) {
        throw Exception('Failed to write user to database: status ${response.statusCode}');
      }
    } catch (e) {
      print('Firebase RTDB signup write failed: $e. Using local fallback.');
    }

    MockDatabase.userCustomerTable[userId] = record;

    return UserModel(
      id: userId,
      fullName: fullName,
      mobileNumber: formattedMobile,
      username: username,
      email: email,
      password: password,
    );
  }

  Future<UserModel> updateProfile(UserModel user) async {
    final record = {
      'fullName': user.fullName,
      'mobileNumber': user.mobileNumber,
      'username': user.username,
      'email': user.email,
      'password': user.password,
    };

    try {
      final response = await http.patch(
        Uri.parse('$_dbUrl/user_customer/${user.id}.json'),
        body: json.encode(record),
      ).timeout(const Duration(seconds: 5));
      if (response.statusCode != 200) {
        throw Exception('Failed to update profile: status ${response.statusCode}');
      }
    } catch (e) {
      print('Firebase RTDB profile update failed: $e. Using local fallback.');
    }

    MockDatabase.userCustomerTable[user.id] = record;
    return user;
  }
}

class FoodRepository {
  Future<List<FoodItem>> getFoodCatalog() async {
    await Future.delayed(const Duration(milliseconds: 500));
    return MockDatabase.foodItems.map((item) => item.copyWith()).toList();
  }

  Future<List<String>> getCategories() async {
    return MockDatabase.categories;
  }
}

Map<String, dynamic> _addressToMap(Address address) {
  return {
    'id': address.id,
    'title': address.title,
    'addressLine': address.addressLine,
    'landmark': address.landmark,
    'pinCode': address.pinCode,
    'type': address.type,
  };
}

Address _mapToAddress(Map map) {
  return Address(
    id: map['id'] ?? '',
    title: map['title'] ?? '',
    addressLine: map['addressLine'] ?? '',
    landmark: map['landmark'] ?? '',
    pinCode: map['pinCode'] ?? '',
    type: map['type'] ?? '',
  );
}

Map<String, dynamic> _couponToMap(Coupon coupon) {
  return {
    'code': coupon.code,
    'description': coupon.description,
    'discountPercentage': coupon.discountPercentage,
    'flatDiscount': coupon.flatDiscount,
    'minOrderValue': coupon.minOrderValue,
    'maxDiscount': coupon.maxDiscount,
  };
}

Coupon _mapToCoupon(Map map) {
  return Coupon(
    code: map['code'] ?? '',
    description: map['description'] ?? '',
    discountPercentage: (map['discountPercentage'] as num?)?.toDouble() ?? 0.0,
    flatDiscount: (map['flatDiscount'] as num?)?.toDouble() ?? 0.0,
    minOrderValue: (map['minOrderValue'] as num?)?.toDouble() ?? 0.0,
    maxDiscount: (map['maxDiscount'] as num?)?.toDouble() ?? 0.0,
  );
}

Map<String, dynamic> _foodItemToMap(FoodItem item) {
  return {
    'id': item.id,
    'name': item.name,
    'description': item.description,
    'basePrice': item.basePrice,
    'imageUrl': item.imageUrl,
    'rating': item.rating,
    'reviewsCount': item.reviewsCount,
    'category': item.category,
    'isVeg': item.isVeg,
    'customizationGroups': item.customizationGroups.map((g) => {
      'title': g.title,
      'isRequired': g.isRequired,
      'isMultiSelect': g.isMultiSelect,
      'options': g.options.map((o) => {
        'name': o.name,
        'additionalPrice': o.additionalPrice,
        'isSelected': o.isSelected,
      }).toList(),
    }).toList(),
  };
}

FoodItem _mapToFoodItem(Map map) {
  final groupsList = map['customizationGroups'] as List? ?? [];
  final groups = groupsList.map((gMap) {
    final optsList = gMap['options'] as List? ?? [];
    final options = optsList.map((oMap) => CustomizationOption(
      name: oMap['name'] ?? '',
      additionalPrice: (oMap['additionalPrice'] as num?)?.toDouble() ?? 0.0,
      isSelected: oMap['isSelected'] ?? false,
    )).toList();
    return CustomizationGroup(
      title: gMap['title'] ?? '',
      isRequired: gMap['isRequired'] ?? false,
      isMultiSelect: gMap['isMultiSelect'] ?? false,
      options: options,
    );
  }).toList();

  return FoodItem(
    id: map['id'] ?? '',
    name: map['name'] ?? '',
    description: map['description'] ?? '',
    basePrice: (map['basePrice'] as num?)?.toDouble() ?? 0.0,
    imageUrl: map['imageUrl'] ?? '',
    rating: (map['rating'] as num?)?.toDouble() ?? 0.0,
    reviewsCount: (map['reviewsCount'] as num?)?.toInt() ?? 0,
    category: map['category'] ?? '',
    isVeg: map['isVeg'] ?? false,
    customizationGroups: groups,
  );
}

Map<String, dynamic> _cartItemToMap(CartItem item) {
  return {
    'id': item.id,
    'quantity': item.quantity,
    'foodItem': _foodItemToMap(item.foodItem),
  };
}

CartItem _mapToCartItem(Map map) {
  return CartItem(
    id: map['id'] ?? '',
    quantity: (map['quantity'] as num?)?.toInt() ?? 1,
    foodItem: _mapToFoodItem(map['foodItem'] as Map? ?? {}),
  );
}

Map<String, dynamic> _orderToMap(OrderModel order) {
  return {
    'id': order.id,
    'orderDate': order.orderDate.toIso8601String(),
    'status': order.status,
    'deliveryAddress': _addressToMap(order.deliveryAddress),
    'paymentMethod': order.paymentMethod,
    'couponApplied': order.couponApplied != null ? _couponToMap(order.couponApplied!) : null,
    'subtotal': order.subtotal,
    'deliveryFee': order.deliveryFee,
    'tax': order.tax,
    'discount': order.discount,
    'total': order.total,
    'items': order.items.map((i) => _cartItemToMap(i)).toList(),
  };
}

OrderModel _mapToOrder(String id, Map map) {
  final itemsList = map['items'] as List? ?? [];
  final items = itemsList.map((iMap) => _mapToCartItem(iMap as Map)).toList();
  return OrderModel(
    id: id,
    orderDate: DateTime.tryParse(map['orderDate'] ?? '') ?? DateTime.now(),
    status: map['status'] ?? 'Placed',
    deliveryAddress: _mapToAddress(map['deliveryAddress'] as Map? ?? {}),
    paymentMethod: map['paymentMethod'] ?? '',
    couponApplied: map['couponApplied'] != null ? _mapToCoupon(map['couponApplied'] as Map) : null,
    subtotal: (map['subtotal'] as num?)?.toDouble() ?? 0.0,
    deliveryFee: (map['deliveryFee'] as num?)?.toDouble() ?? 0.0,
    tax: (map['tax'] as num?)?.toDouble() ?? 0.0,
    discount: (map['discount'] as num?)?.toDouble() ?? 0.0,
    total: (map['total'] as num?)?.toDouble() ?? 0.0,
    items: items,
  );
}

class AddressRepository {
  static const String _dbUrl = 'https://dineos-123-default-rtdb.asia-southeast1.firebasedatabase.app';
  final List<Address> _localAddresses = List.from(MockDatabase.initialAddresses);

  Future<List<Address>> getAddresses() async {
    final userId = MockDatabase.currentUserId;
    if (userId == null) {
      await Future.delayed(const Duration(milliseconds: 300));
      return List.from(_localAddresses);
    }

    try {
      final response = await http.get(Uri.parse('$_dbUrl/user_customer/$userId/addresses.json')).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        if (decoded is Map) {
          final list = <Address>[];
          decoded.forEach((key, val) {
            if (val is Map) {
              list.add(Address(
                id: key.toString(),
                title: val['title'] ?? '',
                addressLine: val['addressLine'] ?? '',
                landmark: val['landmark'] ?? '',
                pinCode: val['pinCode'] ?? '',
                type: val['type'] ?? '',
              ));
            }
          });
          return list;
        } else if (decoded == null) {
          // Sync default addresses to DB for first time signup
          final list = List<Address>.from(MockDatabase.initialAddresses);
          for (final addr in list) {
            await addAddress(addr);
          }
          return list;
        }
      }
    } catch (e) {
      print('Firebase RTDB getAddresses failed: $e');
    }

    return List.from(_localAddresses);
  }

  Future<Address> addAddress(Address address) async {
    final userId = MockDatabase.currentUserId;
    final newId = address.id.isEmpty ? 'addr_${DateTime.now().millisecondsSinceEpoch}' : address.id;
    final newAddress = address.copyWith(id: newId);

    if (userId == null) {
      await Future.delayed(const Duration(milliseconds: 300));
      _localAddresses.add(newAddress);
      return newAddress;
    }

    final data = {
      'title': address.title,
      'addressLine': address.addressLine,
      'landmark': address.landmark,
      'pinCode': address.pinCode,
      'type': address.type,
    };

    try {
      final response = await http.put(
        Uri.parse('$_dbUrl/user_customer/$userId/addresses/$newId.json'),
        body: json.encode(data),
      ).timeout(const Duration(seconds: 5));
      if (response.statusCode != 200 && response.statusCode != 201) {
        throw Exception('Status ${response.statusCode}');
      }
    } catch (e) {
      print('Firebase RTDB addAddress failed: $e');
    }

    _localAddresses.add(newAddress);
    return newAddress;
  }

  Future<Address> updateAddress(Address address) async {
    final userId = MockDatabase.currentUserId;
    if (userId == null) {
      await Future.delayed(const Duration(milliseconds: 300));
      final index = _localAddresses.indexWhere((element) => element.id == address.id);
      if (index != -1) {
        _localAddresses[index] = address;
      }
      return address;
    }

    final data = {
      'title': address.title,
      'addressLine': address.addressLine,
      'landmark': address.landmark,
      'pinCode': address.pinCode,
      'type': address.type,
    };

    try {
      final response = await http.put(
        Uri.parse('$_dbUrl/user_customer/$userId/addresses/${address.id}.json'),
        body: json.encode(data),
      ).timeout(const Duration(seconds: 5));
      if (response.statusCode != 200) {
        throw Exception('Status ${response.statusCode}');
      }
    } catch (e) {
      print('Firebase RTDB updateAddress failed: $e');
    }

    final index = _localAddresses.indexWhere((element) => element.id == address.id);
    if (index != -1) {
      _localAddresses[index] = address;
    }
    return address;
  }

  Future<void> deleteAddress(String id) async {
    final userId = MockDatabase.currentUserId;
    if (userId == null) {
      await Future.delayed(const Duration(milliseconds: 300));
      _localAddresses.removeWhere((element) => element.id == id);
      return;
    }

    try {
      final response = await http.delete(
        Uri.parse('$_dbUrl/user_customer/$userId/addresses/$id.json'),
      ).timeout(const Duration(seconds: 5));
      if (response.statusCode != 200) {
        throw Exception('Status ${response.statusCode}');
      }
    } catch (e) {
      print('Firebase RTDB deleteAddress failed: $e');
    }

    _localAddresses.removeWhere((element) => element.id == id);
  }
}

class OrderRepository {
  static const String _dbUrl = 'https://dineos-123-default-rtdb.asia-southeast1.firebasedatabase.app';
  final List<OrderModel> _localOrders = List.from(MockDatabase.initialOrders);

  Future<List<OrderModel>> getOrders() async {
    final userId = MockDatabase.currentUserId;
    if (userId == null) {
      await Future.delayed(const Duration(milliseconds: 300));
      _localOrders.sort((a, b) => b.orderDate.compareTo(a.orderDate));
      return List.from(_localOrders);
    }

    try {
      final response = await http.get(Uri.parse('$_dbUrl/user_customer/$userId/orders.json')).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        if (decoded is Map) {
          final list = <OrderModel>[];
          decoded.forEach((key, val) {
            if (val is Map) {
              list.add(_mapToOrder(key.toString(), val));
            }
          });
          list.sort((a, b) => b.orderDate.compareTo(a.orderDate));
          return list;
        } else if (decoded == null) {
          // Seed initial orders for test user
          final list = List<OrderModel>.from(MockDatabase.initialOrders);
          for (final order in list) {
            final orderData = _orderToMap(order);
            await http.put(
              Uri.parse('$_dbUrl/user_customer/$userId/orders/${order.id}.json'),
              body: json.encode(orderData),
            );
          }
          list.sort((a, b) => b.orderDate.compareTo(a.orderDate));
          return list;
        }
      }
    } catch (e) {
      print('Firebase RTDB getOrders failed: $e');
    }

    _localOrders.sort((a, b) => b.orderDate.compareTo(a.orderDate));
    return List.from(_localOrders);
  }

  Future<OrderModel> placeOrder(
    List<CartItem> items,
    Address address,
    String paymentMethod,
    Coupon? coupon,
    double subtotal,
    double deliveryFee,
    double tax,
    double discount,
    double total,
  ) async {
    final userId = MockDatabase.currentUserId;
    final orderId = 'ORD-${10000 + DateTime.now().millisecondsSinceEpoch % 90000}';
    final newOrder = OrderModel(
      id: orderId,
      items: items.map((e) => e.copyWith()).toList(),
      orderDate: DateTime.now(),
      status: 'Placed',
      deliveryAddress: address,
      paymentMethod: paymentMethod,
      couponApplied: coupon,
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      tax: tax,
      discount: discount,
      total: total,
    );

    if (userId == null) {
      await Future.delayed(const Duration(milliseconds: 300));
      _localOrders.insert(0, newOrder);
      return newOrder;
    }

    final orderData = _orderToMap(newOrder);

    try {
      final response = await http.put(
        Uri.parse('$_dbUrl/user_customer/$userId/orders/$orderId.json'),
        body: json.encode(orderData),
      ).timeout(const Duration(seconds: 5));
      if (response.statusCode != 200 && response.statusCode != 201) {
        throw Exception('Status ${response.statusCode}');
      }
    } catch (e) {
      print('Firebase RTDB placeOrder failed: $e');
    }

    _localOrders.insert(0, newOrder);
    return newOrder;
  }
}
