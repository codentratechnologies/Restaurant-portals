import 'dart:async';
import '../models/user_model.dart';
import '../models/food_item.dart';
import '../models/coupon.dart';
import '../models/address.dart';
import '../models/order.dart';
import '../models/cart_item.dart';
import '../mock/mock_database.dart';

class AuthRepository {
  Future<UserModel> login(String email, String password) async {
    await Future.delayed(const Duration(milliseconds: 800)); // Simulate API lag
    if (email.isEmpty || password.isEmpty) {
      throw Exception('Email and password are required');
    }
    // Return mock user
    return UserModel(
      id: 'usr_882',
      name: 'Oliver Queen',
      email: email,
      phone: '+1 (555) 019-2834',
    );
  }

  Future<UserModel> signup(String name, String email, String phone, String password) async {
    await Future.delayed(const Duration(milliseconds: 1000));
    if (name.isEmpty || email.isEmpty || phone.isEmpty || password.isEmpty) {
      throw Exception('All fields are required');
    }
    return UserModel(
      id: 'usr_882',
      name: name,
      email: email,
      phone: phone,
    );
  }

  Future<UserModel> updateProfile(UserModel user) async {
    await Future.delayed(const Duration(milliseconds: 600));
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

class AddressRepository {
  final List<Address> _addresses = List.from(MockDatabase.initialAddresses);

  Future<List<Address>> getAddresses() async {
    await Future.delayed(const Duration(milliseconds: 400));
    return List.from(_addresses);
  }

  Future<Address> addAddress(Address address) async {
    await Future.delayed(const Duration(milliseconds: 500));
    final newAddress = address.copyWith(
      id: 'addr_${DateTime.now().millisecondsSinceEpoch}',
    );
    _addresses.add(newAddress);
    return newAddress;
  }

  Future<Address> updateAddress(Address address) async {
    await Future.delayed(const Duration(milliseconds: 500));
    final index = _addresses.indexWhere((element) => element.id == address.id);
    if (index != -1) {
      _addresses[index] = address;
    }
    return address;
  }

  Future<void> deleteAddress(String id) async {
    await Future.delayed(const Duration(milliseconds: 300));
    _addresses.removeWhere((element) => element.id == id);
  }
}

class OrderRepository {
  final List<OrderModel> _orders = List.from(MockDatabase.initialOrders);

  Future<List<OrderModel>> getOrders() async {
    await Future.delayed(const Duration(milliseconds: 600));
    // Sort by order date descending
    _orders.sort((a, b) => b.orderDate.compareTo(a.orderDate));
    return List.from(_orders);
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
    await Future.delayed(const Duration(milliseconds: 1200));
    final newOrder = OrderModel(
      id: 'ORD-${10000 + DateTime.now().millisecondsSinceEpoch % 90000}',
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
    _orders.add(newOrder);
    return newOrder;
  }
}
