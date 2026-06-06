import 'cart_item.dart';
import 'address.dart';
import 'coupon.dart';

class OrderModel {
  final String id;
  final List<CartItem> items;
  final DateTime orderDate;
  String status; // 'Placed' | 'Preparing' | 'Out for Delivery' | 'Delivered'
  final Address deliveryAddress;
  final String paymentMethod;
  final Coupon? couponApplied;
  final double subtotal;
  final double deliveryFee;
  final double tax;
  final double discount;
  final double total;

  OrderModel({
    required this.id,
    required this.items,
    required this.orderDate,
    required this.status,
    required this.deliveryAddress,
    required this.paymentMethod,
    this.couponApplied,
    required this.subtotal,
    required this.deliveryFee,
    required this.tax,
    required this.discount,
    required this.total,
  });

  OrderModel copyWith({
    String? id,
    List<CartItem>? items,
    DateTime? orderDate,
    String? status,
    Address? deliveryAddress,
    String? paymentMethod,
    Coupon? couponApplied,
    double? subtotal,
    double? deliveryFee,
    double? tax,
    double? discount,
    double? total,
  }) {
    return OrderModel(
      id: id ?? this.id,
      items: items ?? this.items.map((e) => e.copyWith()).toList(),
      orderDate: orderDate ?? this.orderDate,
      status: status ?? this.status,
      deliveryAddress: deliveryAddress ?? this.deliveryAddress.copyWith(),
      paymentMethod: paymentMethod ?? this.paymentMethod,
      couponApplied: couponApplied ?? this.couponApplied,
      subtotal: subtotal ?? this.subtotal,
      deliveryFee: deliveryFee ?? this.deliveryFee,
      tax: tax ?? this.tax,
      discount: discount ?? this.discount,
      total: total ?? this.total,
    );
  }
}
