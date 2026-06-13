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

  Future<void> fetchAndUpdateOrderStatus(String orderId) async {
    String? branchId;
    final idx = _orders.indexWhere((o) => o.id == orderId);
    if (idx != -1) {
      branchId = _orders[idx].branchId;
    } else if (_activeOrder?.id == orderId) {
      branchId = _activeOrder!.branchId;
    }

    final newStatus = await _orderRepository.fetchOrderStatus(orderId, branchId: branchId);
    if (newStatus == null) return;
    
    final deliveryInfo = await _orderRepository.fetchDeliveryInfo(orderId, branchId: branchId);

    final updatedIdx = _orders.indexWhere((o) => o.id == orderId);
    if (updatedIdx != -1) {
      bool changed = false;
      var currentOrder = _orders[updatedIdx];
      if (currentOrder.status != newStatus) {
        currentOrder = currentOrder.copyWith(status: newStatus);
        changed = true;
      }
      if (deliveryInfo != null) {
        if (currentOrder.deliveryPartnerName != deliveryInfo['deliveryPartnerName'] ||
            currentOrder.otp != deliveryInfo['otp']) {
          currentOrder = currentOrder.copyWith(
            deliveryPartnerName: deliveryInfo['deliveryPartnerName']?.toString(),
            deliveryPartnerMobile: deliveryInfo['mobileNumber']?.toString(),
            otp: deliveryInfo['otp']?.toString(),
          );
          changed = true;
        }
      }
      if (changed) {
        _orders[updatedIdx] = currentOrder;
        notifyListeners();
      }
    }
    // Also update activeOrder if it matches
    if (_activeOrder?.id == orderId) {
      bool changed = false;
      var currentOrder = _activeOrder!;
      if (currentOrder.status != newStatus) {
        currentOrder = currentOrder.copyWith(status: newStatus);
        changed = true;
      }
      if (deliveryInfo != null) {
        if (currentOrder.deliveryPartnerName != deliveryInfo['deliveryPartnerName'] ||
            currentOrder.otp != deliveryInfo['otp']) {
          currentOrder = currentOrder.copyWith(
            deliveryPartnerName: deliveryInfo['deliveryPartnerName']?.toString(),
            deliveryPartnerMobile: deliveryInfo['mobileNumber']?.toString(),
            otp: deliveryInfo['otp']?.toString(),
          );
          changed = true;
        }
      }
      if (changed) {
        _activeOrder = currentOrder;
        notifyListeners();
      }
    }
  }
}
