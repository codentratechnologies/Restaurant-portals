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
import '../models/branch.dart';
import '../models/support_ticket.dart';
import '../mock/mock_database.dart';


String generateFirebaseUid() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  final random = Random();
  return List.generate(28, (index) => chars[random.nextInt(chars.length)]).join();
}

Future<String> _getOrFetchAdminId() async {
  if (MockDatabase.currentAdminId != null) {
    return MockDatabase.currentAdminId!;
  }
  // Try getting from branch.json
  try {
    final response = await http.get(Uri.parse('https://dineos-123-default-rtdb.asia-southeast1.firebasedatabase.app/branch.json')).timeout(const Duration(seconds: 5));
    if (response.statusCode == 200) {
      final decoded = json.decode(response.body);
      if (decoded is Map && decoded.isNotEmpty) {
        final adminId = decoded.keys.first.toString();
        MockDatabase.currentAdminId = adminId;
        return adminId;
      }
    }
  } catch (e) {
    print('Error getting adminId from branch: $e');
  }

  // Try getting from menu.json
  try {
    final response = await http.get(Uri.parse('https://dineos-123-default-rtdb.asia-southeast1.firebasedatabase.app/menu.json')).timeout(const Duration(seconds: 5));
    if (response.statusCode == 200) {
      final decoded = json.decode(response.body);
      if (decoded is Map && decoded.isNotEmpty) {
        final adminId = decoded.keys.first.toString();
        MockDatabase.currentAdminId = adminId;
        return adminId;
      }
    }
  } catch (e) {
    print('Error getting adminId from menu: $e');
  }

  return 'IjrrNmUTrlSP2qsK47DcCLNZSI22'; // Database default admin ID fallback
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
          decoded.forEach((adminKey, adminMap) {
            if (adminMap is Map) {
              adminMap.forEach((userKey, userVal) {
                if (userVal is Map) {
                  final userRecord = Map<String, dynamic>.from(userVal);
                  userRecord['adminId'] = adminKey.toString();
                  result[userKey.toString()] = userRecord;
                }
              });
            } else {
              // Fallback for legacy un-nested users if any
              result[adminKey.toString()] = Map<String, dynamic>.from(adminMap);
            }
          });
          // Sync to local mock database
          MockDatabase.userCustomerTable.clear();
          MockDatabase.userCustomerTable.addAll(result);
          return result;
        }
      }
    } catch (e) {
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
      MockDatabase.currentAdminId = foundUserRecord!['adminId'];
      return UserModel(
        id: foundUserId!,
        fullName: foundUserRecord!['fullName'] ?? '',
        mobileNumber: foundUserRecord!['mobileNumber'] ?? '',
        username: foundUserRecord!['username'] ?? '',
        email: foundUserRecord!['email'] ?? '',
        password: foundUserRecord!['password'] ?? '',
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
    final String adminId = await _getOrFetchAdminId();

    final record = {
      'fullName': fullName,
      'mobileNumber': formattedMobile,
      'username': username,
      'email': email,
      'password': password,
    };

    try {
      final response = await http.put(
        Uri.parse('$_dbUrl/user_customer/$adminId/$userId.json'),
        body: json.encode(record),
      ).timeout(const Duration(seconds: 5));
      if (response.statusCode != 200 && response.statusCode != 201) {
        throw Exception('Failed to write user to database: status ${response.statusCode}');
      }
    } catch (e) {
      print('Firebase RTDB signup write failed: $e. Using local fallback.');
    }

    MockDatabase.userCustomerTable[userId] = record;
    MockDatabase.currentAdminId = adminId;

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
    final adminId = await _getOrFetchAdminId();
    final record = {
      'fullName': user.fullName,
      'mobileNumber': user.mobileNumber,
      'username': user.username,
      'email': user.email,
      'password': user.password,
    };

    try {
      final response = await http.patch(
        Uri.parse('$_dbUrl/user_customer/$adminId/${user.id}.json'),
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
  static const String _dbUrl = 'https://dineos-123-default-rtdb.asia-southeast1.firebasedatabase.app';

  Future<List<FoodItem>> getFoodCatalog() async {
    // Also load coupons in background so they are synced automatically:
    getCoupons().catchError((e) {
      print('Coupons background sync failed: $e');
      return <Coupon>[];
    });

    try {
      final response = await http.get(Uri.parse('$_dbUrl/menu.json')).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        if (decoded is Map) {
          final List<FoodItem> loadedItems = [];
          final Set<String> loadedCategories = {'All'};

          decoded.forEach((restaurantId, categoriesMap) {
            if (categoriesMap is Map) {
              categoriesMap.forEach((categoryName, itemsMap) {
                if (itemsMap is Map) {
                  itemsMap.forEach((itemId, itemVal) {
                    if (itemVal is Map) {
                      final category = itemVal['category']?.toString() ?? categoryName.toString();
                      loadedCategories.add(category);

                      // Dynamically map customization options from the database
                      List<CustomizationGroup> custGroups = [];
                      if (itemVal.containsKey('customizations') && itemVal['customizations'] is List) {
                        final custs = itemVal['customizations'] as List;
                        if (custs.isNotEmpty) {
                          final List<CustomizationOption> options = [];
                          for (var c in custs) {
                            if (c is Map) {
                              options.add(CustomizationOption(
                                name: c['label']?.toString() ?? '',
                                additionalPrice: (c['price'] as num?)?.toDouble() ?? 0.0,
                                isSelected: false,
                              ));
                            }
                          }
                          if (options.isNotEmpty) {
                            custGroups.add(CustomizationGroup(
                              title: 'Customizations',
                              isMultiSelect: true,
                              options: options,
                            ));
                          }
                        }
                      }

                      loadedItems.add(FoodItem(
                        id: itemId.toString(),
                        name: itemVal['name']?.toString() ?? '',
                        description: itemVal['description']?.toString() ?? '',
                        basePrice: (itemVal['price'] as num?)?.toDouble() ?? 0.0,
                        imageUrl: itemVal['image_url']?.toString() ?? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
                        rating: 4.5 + (Random().nextDouble() * 0.4),
                        reviewsCount: 30 + Random().nextInt(100),
                        category: category,
                        isVeg: itemVal['is_vegetarian'] ?? false,
                        customizationGroups: custGroups,
                      ));
                    }
                  });
                }
              });
            }
          });

          // Sync local mock database lists:
          MockDatabase.foodItems.clear();
          MockDatabase.foodItems.addAll(loadedItems);

          MockDatabase.categories.clear();
          MockDatabase.categories.addAll(loadedCategories.toList()..sort());

          return loadedItems;
        }
      }
    } catch (e) {
      print('Error loading food catalog from Firebase: $e');
    }

    // Fallback
    return MockDatabase.foodItems.map((e) => e.copyWith()).toList();
  }

  Future<List<String>> getCategories() async {
    // If empty, fetch catalog to populate categories dynamically:
    if (MockDatabase.categories.length <= 1) {
      await getFoodCatalog();
    }
    return MockDatabase.categories;
  }

  Future<List<Coupon>> getCoupons() async {
    try {
      final response = await http.get(Uri.parse('$_dbUrl/coupons.json')).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        if (decoded is Map) {
          final Map<String, Coupon> listMap = {};
          
          decoded.forEach((adminId, adminData) {
            if (MockDatabase.currentAdminId != null && adminId != MockDatabase.currentAdminId) {
              return;
            }
            if (adminData is Map) {
              adminData.forEach((couponKey, couponData) {
                if (couponData is Map) {
                  final coupon = _mapToCoupon(couponData);
                  if (coupon.code.isNotEmpty) {
                    listMap[coupon.code] = coupon;
                  }
                }
              });
            } else if (adminData is String && adminId == 'code') {
              final coupon = _mapToCoupon(decoded);
              if (coupon.code.isNotEmpty) {
                listMap[coupon.code] = coupon;
              }
            }
          });
          
          if (listMap.isEmpty) {
            decoded.forEach((key, val) {
              if (val is Map) {
                final coupon = _mapToCoupon(val);
                if (coupon.code.isNotEmpty) {
                  listMap[coupon.code] = coupon;
                }
              }
            });
          }

          final List<Coupon> list = listMap.values.toList();
          MockDatabase.coupons.clear();
          MockDatabase.coupons.addAll(list);
          return list;
        } else if (decoded == null) {
          MockDatabase.coupons.clear();
          return [];
        }
      }
    } catch (e) {
      print('Firebase RTDB getCoupons failed: $e');
    }
    return MockDatabase.coupons;
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
    'discountType': coupon.discountType,
    'discountValue': coupon.discountValue,
    'maxDiscountAmount': coupon.maxDiscountAmount,
    'validFrom': coupon.validFrom,
    'validUntil': coupon.validUntil,
    'status': coupon.status,
    'targetAudience': coupon.targetAudience,
    'applicableBranches': coupon.applicableBranches,
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
    discountType: map['discountType'] ?? 'Flat',
    discountValue: (map['discountValue'] as num?)?.toDouble() ?? 0.0,
    maxDiscountAmount: (map['maxDiscountAmount'] as num?)?.toDouble() ?? 0.0,
    validFrom: map['validFrom'] ?? '',
    validUntil: map['validUntil'] ?? '',
    status: map['status'] ?? 'Active',
    targetAudience: map['targetAudience'] ?? 'All',
    applicableBranches: map['applicableBranches'] ?? 'All Branches',
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
  final selectedCustomizations = item.foodItem.customizationGroups
      .expand((g) => g.options.where((o) => o.isSelected))
      .map((o) => {
        'label': o.name,
        'price': o.additionalPrice,
      })
      .toList();

  return {
    'id': item.id,
    'menu_item_id': item.foodItem.id,
    'name': item.foodItem.name,
    'quantity': item.quantity,
    'unit_price': item.unitPrice,
    'total_price': item.totalPrice,
    'customizations': selectedCustomizations,
  };
}

CartItem _mapToCartItem(Map map) {
  final qty = (map['quantity'] as num?)?.toInt() ?? (map['qty'] as num?)?.toInt() ?? 1;
  FoodItem foodItem;
  
  if (map.containsKey('foodItem')) {
    foodItem = _mapToFoodItem(map['foodItem'] as Map? ?? {});
  } else {
    final menuId = map['menu_item_id'] ?? map['id'] ?? '';
    final name = map['name'] ?? '';
    final unitPrice = (map['unit_price'] as num?)?.toDouble() ?? (map['price'] as num?)?.toDouble() ?? 0.0;
    
    // Attempt lookup in current database catalog
    FoodItem? catalogItem;
    for (var element in MockDatabase.foodItems) {
      if (element.id == menuId) {
        catalogItem = element;
        break;
      }
    }

    if (catalogItem != null) {
      // Clone it
      foodItem = catalogItem.copyWith();
      // Deselect all customization options first
      for (var group in foodItem.customizationGroups) {
        for (var option in group.options) {
          option.isSelected = false;
        }
      }
      // Set selections based on DB record
      final custsList = map['customizations'] as List? ?? [];
      for (var c in custsList) {
        if (c is Map) {
          final label = c['label']?.toString() ?? c['name']?.toString() ?? '';
          for (var group in foodItem.customizationGroups) {
            for (var option in group.options) {
              if (option.name == label) {
                option.isSelected = true;
              }
            }
          }
        }
      }
    } else {
      // Reconstruct foodItem dynamically if catalog item is not found
      final List<CustomizationOption> options = [];
      final custsList = map['customizations'] as List? ?? [];
      for (var c in custsList) {
        if (c is Map) {
          options.add(CustomizationOption(
            name: c['label']?.toString() ?? c['name']?.toString() ?? '',
            additionalPrice: (c['price'] as num?)?.toDouble() ?? (c['additionalPrice'] as num?)?.toDouble() ?? 0.0,
            isSelected: true,
          ));
        }
      }
      
      List<CustomizationGroup> groups = [];
      if (options.isNotEmpty) {
        groups.add(CustomizationGroup(
          title: 'Customizations',
          isMultiSelect: true,
          options: options,
        ));
      }

      foodItem = FoodItem(
        id: menuId,
        name: name,
        description: '',
        basePrice: unitPrice - options.fold(0.0, (sum, o) => sum + o.additionalPrice),
        imageUrl: '',
        rating: 4.5,
        reviewsCount: 10,
        category: '',
        isVeg: false,
        customizationGroups: groups,
      );
    }
  }

  return CartItem(
    id: map['id'] ?? '',
    quantity: qty,
    foodItem: foodItem,
  );
}

Map<String, dynamic> _orderToMap(OrderModel order) {
  return {
    'id': order.id,
    'branchId': order.branchId,
    'customerId': order.customerId ?? MockDatabase.currentUserId,
    'orderDate': order.orderDate.toIso8601String(),
    'status': order.status,
    'deliveryAddress': _addressToMap(order.deliveryAddress),
    'paymentMethod': order.paymentMethod,
    'paymentStatus': order.paymentStatus,
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
  final methodLower = (map['paymentMethod']?.toString() ?? '').toLowerCase().trim();
  final computedStatus = (methodLower == 'cash on delivery' || methodLower == 'cod') ? 'Postpaid' : 'Prepaid';
  return OrderModel(
    id: id,
    branchId: map['branchId']?.toString() ?? '',
    customerId: map['customerId']?.toString(),
    orderDate: DateTime.tryParse(map['orderDate'] ?? '') ?? DateTime.now(),
    status: map['status'] ?? 'Placed',
    deliveryAddress: _mapToAddress(map['deliveryAddress'] as Map? ?? {}),
    paymentMethod: map['paymentMethod'] ?? '',
    paymentStatus: map['paymentStatus'] ?? computedStatus,
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
      final adminId = await _getOrFetchAdminId();
      final response = await http.get(Uri.parse('$_dbUrl/user_customer/$adminId/$userId/addresses.json')).timeout(const Duration(seconds: 5));
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
      final adminId = await _getOrFetchAdminId();
      final response = await http.put(
        Uri.parse('$_dbUrl/user_customer/$adminId/$userId/addresses/$newId.json'),
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
      final adminId = await _getOrFetchAdminId();
      final response = await http.put(
        Uri.parse('$_dbUrl/user_customer/$adminId/$userId/addresses/${address.id}.json'),
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
      final adminId = await _getOrFetchAdminId();
      final response = await http.delete(
        Uri.parse('$_dbUrl/user_customer/$adminId/$userId/addresses/$id.json'),
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
      final adminId = await _getOrFetchAdminId();
      final response = await http.get(Uri.parse('$_dbUrl/order/$adminId.json')).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        if (decoded is Map) {
          final list = <OrderModel>[];
          decoded.forEach((branchId, ordersMap) {
            if (ordersMap is Map) {
              ordersMap.forEach((orderId, orderVal) {
                if (orderVal is Map) {
                  final order = _mapToOrder(orderId.toString(), orderVal);
                  if (order.customerId == userId) {
                    list.add(order);
                  }
                }
              });
            }
          });
          list.sort((a, b) => b.orderDate.compareTo(a.orderDate));
          return list;
        } else if (decoded == null) {
          return [];
        }
      }
    } catch (e) {
      print('Firebase RTDB getOrders failed: $e');
    }

    _localOrders.sort((a, b) => b.orderDate.compareTo(a.orderDate));
    return List.from(_localOrders);
  }

  /// Fetches only the status string for a single order from Firebase.
  /// Returns null if the order isn't found or network fails.
  Future<String?> fetchOrderStatus(String orderId, {String? branchId}) async {
    final userId = MockDatabase.currentUserId;
    if (userId == null) return null;
    try {
      final adminId = await _getOrFetchAdminId();
      String resolvedBranchId = branchId ?? '';
      if (resolvedBranchId.isEmpty) {
        for (var o in MockDatabase.initialOrders) {
          if (o.id == orderId) {
            resolvedBranchId = o.branchId;
            break;
          }
        }
      }
      if (resolvedBranchId.isEmpty) {
        final response = await http.get(Uri.parse('$_dbUrl/order/$adminId.json')).timeout(const Duration(seconds: 5));
        if (response.statusCode == 200) {
          final decoded = json.decode(response.body);
          if (decoded is Map) {
            decoded.forEach((bId, ordersMap) {
              if (ordersMap is Map && ordersMap.containsKey(orderId)) {
                resolvedBranchId = bId.toString();
              }
            });
          }
        }
      }
      if (resolvedBranchId.isEmpty) return null;

      final response = await http
          .get(Uri.parse('$_dbUrl/order/$adminId/$resolvedBranchId/$orderId/status.json'))
          .timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        if (decoded is String) return decoded;
      }
    } catch (_) {}
    return null;
  }

  /// Fetches delivery info (partner name, phone, otp) for a given order by searching across all drivers.
  Future<Map<String, dynamic>?> fetchDeliveryInfo(String orderId, {String? branchId}) async {
    final userId = MockDatabase.currentUserId;
    if (userId == null) return null;
    try {
      final adminId = await _getOrFetchAdminId();
      String resolvedBranchId = branchId ?? '';
      if (resolvedBranchId.isEmpty) {
        for (var o in MockDatabase.initialOrders) {
          if (o.id == orderId) {
            resolvedBranchId = o.branchId;
            break;
          }
        }
      }
      if (resolvedBranchId.isEmpty) return null;

      final response = await http
          .get(Uri.parse('$_dbUrl/delivery/$adminId/$resolvedBranchId.json'))
          .timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        if (decoded is Map) {
          for (var driverId in decoded.keys) {
            final ordersMap = decoded[driverId];
            if (ordersMap is Map && ordersMap.containsKey(orderId)) {
              final deliveryData = ordersMap[orderId];
              if (deliveryData is Map) {
                return {
                  'deliveryPartnerName': deliveryData['deliveryPartnerName'],
                  'mobileNumber': deliveryData['mobileNumber'],
                  'otp': deliveryData['otp'],
                };
              }
            }
          }
        }
      }
    } catch (_) {}
    return null;
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
    String branchId,
  ) async {
    final userId = MockDatabase.currentUserId;
    final orderId = 'ORD-${10000 + DateTime.now().millisecondsSinceEpoch % 90000}';
    final methodLower = paymentMethod.toLowerCase().trim();
    final paymentStatus = (methodLower == 'cash on delivery' || methodLower == 'cod') ? 'Postpaid' : 'Prepaid';

    final newOrder = OrderModel(
      id: orderId,
      branchId: branchId,
      customerId: userId,
      items: items.map((e) => e.copyWith()).toList(),
      orderDate: DateTime.now(),
      status: 'Placed',
      deliveryAddress: address,
      paymentMethod: paymentMethod,
      paymentStatus: paymentStatus,
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
      final adminId = await _getOrFetchAdminId();
      final response = await http.put(
        Uri.parse('$_dbUrl/order/$adminId/$branchId/$orderId.json'),
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

class BranchRepository {
  static const String _dbUrl = 'https://dineos-123-default-rtdb.asia-southeast1.firebasedatabase.app';

  Future<void> _resolveBranchCoordinates(Branch branch) async {
    final url = branch.googleMapUrl;
    if (url == null || url.isEmpty) return;

    try {
      final client = http.Client();
      final request = http.Request('GET', Uri.parse(url))..followRedirects = false;
      final response = await client.send(request).timeout(const Duration(seconds: 2));
      final location = response.headers['location'];
      if (location != null) {
        // Parse from !3d...!4d...
        final match3d4d = RegExp(r'!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)').firstMatch(location);
        if (match3d4d != null) {
          final lat = double.tryParse(match3d4d.group(1) ?? '');
          final lng = double.tryParse(match3d4d.group(2) ?? '');
          if (lat != null && lng != null) {
            branch.latitude = lat;
            branch.longitude = lng;
            print('Resolved coordinates for branch ${branch.name} from URL redirect (!3d!4d): lat=$lat, lng=$lng');
            return;
          }
        }

        // Parse from @lat,lng
        final matchAt = RegExp(r'@(-?\d+\.\d+),(-?\d+\.\d+)').firstMatch(location);
        if (matchAt != null) {
          final lat = double.tryParse(matchAt.group(1) ?? '');
          final lng = double.tryParse(matchAt.group(2) ?? '');
          if (lat != null && lng != null) {
            branch.latitude = lat;
            branch.longitude = lng;
            print('Resolved coordinates for branch ${branch.name} from URL redirect (@lat,lng): lat=$lat, lng=$lng');
            return;
          }
        }
      }
    } catch (e) {
      print('Error resolving coordinates for branch ${branch.name}: $e');
    }
  }

  Future<List<Branch>> getBranches() async {
    try {
      final response = await http.get(Uri.parse('$_dbUrl/branch.json')).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        if (decoded is Map) {
          final List<Branch> branches = [];
          decoded.forEach((adminId, branchesMap) {
            if (branchesMap is Map) {
              branchesMap.forEach((branchId, branchVal) {
                if (branchVal is Map) {
                  branches.add(Branch.fromMap(branchId.toString(), branchVal, adminId: adminId.toString()));
                }
              });
            }
          });

          // Resolve Google Maps coordinates for each branch in parallel
          await Future.wait(
            branches.map((branch) => _resolveBranchCoordinates(branch)),
          ).timeout(const Duration(seconds: 3), onTimeout: () {
            print('Warning: Branch coordinate resolution timed out (some branches may use fallbacks).');
            return [];
          });

          return branches;
        }
      }
    } catch (e) {
      print('Error loading branches from Firebase: $e');
    }
    return [];
  }
}

class SupportRepository {
  static const String _dbUrl = 'https://dineos-123-default-rtdb.asia-southeast1.firebasedatabase.app';

  Future<List<SupportTicket>> getTickets() async {
    final userId = MockDatabase.currentUserId;
    if (userId == null) return [];

    try {
      final adminId = await _getOrFetchAdminId();
      final response = await http.get(Uri.parse('$_dbUrl/customer_support/$adminId.json')).timeout(const Duration(seconds: 5));
      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        if (decoded is Map) {
          final List<SupportTicket> list = [];
          decoded.forEach((branchId, branchData) {
            if (branchData is Map) {
              branchData.forEach((ticketId, ticketVal) {
                if (ticketVal is Map) {
                  final ticket = SupportTicket.fromMap(ticketId.toString(), ticketVal);
                  if (ticket.customerId == userId) {
                    list.add(ticket);
                  }
                }
              });
            }
          });
          list.sort((a, b) => b.createdAt.compareTo(a.createdAt));
          return list;
        }
      }
    } catch (e) {
      print('Firebase RTDB getTickets failed: $e');
    }
    return [];
  }

  Future<SupportTicket> createTicket(String branchId, String message) async {
    final userId = MockDatabase.currentUserId ?? 'guest';
    final adminId = await _getOrFetchAdminId();
    final ticketId = 'TKT-${DateTime.now().millisecondsSinceEpoch}';

    String customerName = 'Customer';
    final userMap = MockDatabase.userCustomerTable[userId];
    if (userMap != null) {
      customerName = userMap['fullName']?.toString() ?? 'Customer';
    }

    final newTicket = SupportTicket(
      id: ticketId,
      customerId: userId,
      customerName: customerName,
      branchId: branchId,
      adminId: adminId,
      message: message,
      status: 'Open',
      createdAt: DateTime.now(),
    );

    try {
      final response = await http.put(
        Uri.parse('$_dbUrl/customer_support/$adminId/$branchId/$ticketId.json'),
        body: json.encode(newTicket.toMap()),
      ).timeout(const Duration(seconds: 5));
      if (response.statusCode != 200 && response.statusCode != 201) {
        throw Exception('Status ${response.statusCode}');
      }
    } catch (e) {
      print('Firebase RTDB createTicket failed: $e');
    }

    return newTicket;
  }
}

