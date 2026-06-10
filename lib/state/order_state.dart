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

  List<OrderModel> get orders => _orders;
  OrderModel? get activeOrder => _activeOrder;
  bool get isLoading => _isLoading;

  OrderState() {
    loadOrders();
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
    required String branchId,
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
      branchId,
    );

    _orders.insert(0, order);
    _activeOrder = order;
    _isLoading = false;
    notifyListeners();

    return order;
  }

  void selectActiveOrder(OrderModel order) {
    _activeOrder = order;
    notifyListeners();
  }

  /// Polls Firebase for the latest status of a single order and updates it
  /// in the local list. Lightweight — only reads the status field.
  Future<void> fetchAndUpdateOrderStatus(String orderId) async {
    final newStatus = await _orderRepository.fetchOrderStatus(orderId);
    if (newStatus == null) return;

    final idx = _orders.indexWhere((o) => o.id == orderId);
    if (idx != -1 && _orders[idx].status != newStatus) {
      _orders[idx] = _orders[idx].copyWith(status: newStatus);
      notifyListeners();
    }
    // Also update activeOrder if it matches
    if (_activeOrder?.id == orderId && _activeOrder!.status != newStatus) {
      _activeOrder = _activeOrder!.copyWith(status: newStatus);
      notifyListeners();
    }
  }
}
