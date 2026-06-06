class Coupon {
  final String code;
  final String description;
  final double discountPercentage;
  final double flatDiscount;
  final double minOrderValue;
  final double maxDiscount;

  Coupon({
    required this.code,
    required this.description,
    this.discountPercentage = 0.0,
    this.flatDiscount = 0.0,
    required this.minOrderValue,
    required this.maxDiscount,
  });

  double calculateDiscount(double subtotal) {
    if (subtotal < minOrderValue) return 0.0;
    
    double discount = 0.0;
    if (discountPercentage > 0) {
      discount = subtotal * (discountPercentage / 100);
      if (discount > maxDiscount) {
        discount = maxDiscount;
      }
    } else {
      discount = flatDiscount;
    }
    return discount;
  }
}
