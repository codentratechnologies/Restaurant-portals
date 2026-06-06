import 'dart:async';
import 'package:flutter/material.dart';
import '../data/models/order.dart';
import '../data/models/cart_item.dart';
import '../data/models/address.dart';
import '../data/models/coupon.dart';
import '../data/repositories/mock_repositories.dart';

class OrderState extends ChangeNotifier {
  final OrderRepository _orderRepository = OrderRepository();

  List<OrderModel> _orders = [];
  OrderModel? _activeOrder;
  bool _isLoading = false;
  Timer? _statusTimer;

  List<OrderModel> get orders => _orders;
  OrderModel? get activeOrder => _activeOrder;
  bool get isLoading => _isLoading;

  OrderState() {
    loadOrders();
  }

  @override
  void dispose() {
    _statusTimer?.cancel();
    super.dispose();
  }

  Future<void> loadOrders() async {
    _isLoading = true;
    notifyListeners();

    _orders = await _orderRepository.getOrders();

    _isLoading = false;
    notifyListeners();
  }

  Future<OrderModel> placeOrder({
    required List<CartItem> items,
    required Address address,
    required String paymentMethod,
    required Coupon? coupon,
    required double subtotal,
    required double deliveryFee,
    required double tax,
    required double discount,
    required double total,
  }) async {
    _isLoading = true;
    notifyListeners();

    final order = await _orderRepository.placeOrder(
      items,
      address,
      paymentMethod,
      coupon,
      subtotal,
      deliveryFee,
      tax,
      discount,
      total,
    );

    _orders.insert(0, order);
    _activeOrder = order;
    _isLoading = false;
    notifyListeners();

    // Start real-time simulated tracking status updates
    _startSimulatedTracking();

    return order;
  }

  void selectActiveOrder(OrderModel order) {
    _activeOrder = order;
    notifyListeners();
  }

  void _startSimulatedTracking() {
    _statusTimer?.cancel();
    int currentStep = 0;
    
    // Status sequence: Placed (0) -> Preparing (1) -> Out for Delivery (2) -> Delivered (3)
    final statuses = ['Placed', 'Preparing', 'Out for Delivery', 'Delivered'];

    _statusTimer = Timer.periodic(const Duration(seconds: 10), (timer) {
      if (_activeOrder == null || currentStep >= 3) {
        timer.cancel();
        return;
      }

      currentStep++;
      _activeOrder!.status = statuses[currentStep];

      // Also update in orders list
      final index = _orders.indexWhere((element) => element.id == _activeOrder!.id);
      if (index != -1) {
        _orders[index] = _activeOrder!.copyWith(status: statuses[currentStep]);
      }

      notifyListeners();
    });
  }
}
