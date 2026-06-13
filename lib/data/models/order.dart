import 'cart_item.dart';
import 'address.dart';
import 'coupon.dart';

class CustomerReview {
  final double rating;
  final String comment;

  CustomerReview({
    required this.rating,
    required this.comment,
  });

  Map<String, dynamic> toMap() {
    return {
      'rating': rating,
      'comment': comment,
    };
  }

  factory CustomerReview.fromMap(Map<dynamic, dynamic> map) {
    return CustomerReview(
      rating: (map['rating'] as num?)?.toDouble() ?? 0.0,
      comment: map['comment']?.toString() ?? '',
    );
  }
}

class OrderModel {
  final String id;
  final String branchId;
  final String? customerId;
  final List<CartItem> items;
  final DateTime orderDate;
  String status; // 'Placed' | 'Preparing' | 'Out for Delivery' | 'Delivered'
  final Address deliveryAddress;
  final String paymentMethod;
  final String paymentStatus; // 'Prepaid' | 'Postpaid'
  final Coupon? couponApplied;
  final double subtotal;
  final double deliveryFee;
  final double tax;
  final double discount;
  final double total;
  final String? deliveryPartnerName;
  final String? deliveryPartnerMobile;
  final String? otp;
  final CustomerReview? customerReview;

  OrderModel({
    required this.id,
    required this.branchId,
    this.customerId,
    required this.items,
    required this.orderDate,
    required this.status,
    required this.deliveryAddress,
    required this.paymentMethod,
    required this.paymentStatus,
    this.couponApplied,
    required this.subtotal,
    required this.deliveryFee,
    required this.tax,
    required this.discount,
    required this.total,
    this.deliveryPartnerName,
    this.deliveryPartnerMobile,
    this.otp,
    this.customerReview,
  });

  OrderModel copyWith({
    String? id,
    String? branchId,
    String? customerId,
    List<CartItem>? items,
    DateTime? orderDate,
    String? status,
    Address? deliveryAddress,
    String? paymentMethod,
    String? paymentStatus,
    Coupon? couponApplied,
    double? subtotal,
    double? deliveryFee,
    double? tax,
    double? discount,
    double? total,
    String? deliveryPartnerName,
    String? deliveryPartnerMobile,
    String? otp,
    CustomerReview? customerReview,
  }) {
    return OrderModel(
      id: id ?? this.id,
      branchId: branchId ?? this.branchId,
      customerId: customerId ?? this.customerId,
      items: items ?? this.items,
      orderDate: orderDate ?? this.orderDate,
      status: status ?? this.status,
      deliveryAddress: deliveryAddress ?? this.deliveryAddress,
      paymentMethod: paymentMethod ?? this.paymentMethod,
      paymentStatus: paymentStatus ?? this.paymentStatus,
      couponApplied: couponApplied ?? this.couponApplied,
      subtotal: subtotal ?? this.subtotal,
      deliveryFee: deliveryFee ?? this.deliveryFee,
      tax: tax ?? this.tax,
      discount: discount ?? this.discount,
      total: total ?? this.total,
      deliveryPartnerName: deliveryPartnerName ?? this.deliveryPartnerName,
      deliveryPartnerMobile: deliveryPartnerMobile ?? this.deliveryPartnerMobile,
      otp: otp ?? this.otp,
      customerReview: customerReview ?? this.customerReview,
    );
  }
}
