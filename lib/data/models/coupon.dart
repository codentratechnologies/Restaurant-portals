class Coupon {
  final String code;
  final String description;
  final double discountPercentage; // Fallback
  final double flatDiscount;       // Fallback
  final double minOrderValue;
  final double maxDiscount;        // Fallback
  
  // New database fields
  final String discountType;       // 'Percentage' | 'Flat' or 'Fixed'
  final double discountValue;
  final double maxDiscountAmount;
  final String validFrom;
  final String validUntil;
  final String status;
  final String targetAudience;
  final dynamic applicableBranches;

  Coupon({
    required this.code,
    this.description = '',
    this.discountPercentage = 0.0,
    this.flatDiscount = 0.0,
    required this.minOrderValue,
    this.maxDiscount = 0.0,
    this.discountType = 'Flat',
    this.discountValue = 0.0,
    this.maxDiscountAmount = 0.0,
    this.validFrom = '',
    this.validUntil = '',
    this.status = 'Active',
    this.targetAudience = 'All',
    this.applicableBranches = 'All Branches',
  });

  String get displayDescription {
    if (description.isNotEmpty) return description;
    if (discountType.toLowerCase() == 'percentage') {
      return 'Get ${discountValue.toStringAsFixed(0)}% off up to ₹${maxDiscountAmount.toStringAsFixed(0)} on orders above ₹${minOrderValue.toStringAsFixed(0)}.';
    } else {
      final val = discountValue > 0 ? discountValue : (flatDiscount > 0 ? flatDiscount : maxDiscountAmount);
      return 'Get Flat ₹${val.toStringAsFixed(0)} off on orders above ₹${minOrderValue.toStringAsFixed(0)}.';
    }
  }

  bool get isExpired {
    if (status.toLowerCase() != 'active') return true;
    if (validUntil.isEmpty) return false;
    try {
      final expiryDate = DateTime.parse(validUntil);
      final today = DateTime.now();
      final todayDateOnly = DateTime(today.year, today.month, today.day);
      return todayDateOnly.isAfter(expiryDate);
    } catch (e) {
      return false;
    }
  }

  double calculateDiscount(double subtotal) {
    if (subtotal < minOrderValue) return 0.0;
    
    double discount = 0.0;
    final type = discountType.toLowerCase();
    
    if (type == 'percentage') {
      final val = discountValue > 0 ? discountValue : discountPercentage;
      discount = subtotal * (val / 100);
      final maxAmt = maxDiscountAmount > 0 ? maxDiscountAmount : maxDiscount;
      if (discount > maxAmt) {
        discount = maxAmt;
      }
    } else {
      // Flat or Fixed
      final val = discountValue > 0 ? discountValue : (flatDiscount > 0 ? flatDiscount : maxDiscountAmount);
      discount = val;
    }
    return discount;
  }
}

