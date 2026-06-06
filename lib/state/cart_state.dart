import 'package:flutter/material.dart';
import '../data/models/cart_item.dart';
import '../data/models/food_item.dart';
import '../data/models/coupon.dart';

class CartState extends ChangeNotifier {
  final List<CartItem> _items = [];
  Coupon? _appliedCoupon;
  bool _shouldAnimateBadge = false;

  List<CartItem> get items => _items;
  Coupon? get appliedCoupon => _appliedCoupon;
  bool get shouldAnimateBadge => _shouldAnimateBadge;

  int get totalItemsCount {
    return _items.fold(0, (sum, item) => sum + item.quantity);
  }

  void resetBadgeAnimation() {
    _shouldAnimateBadge = false;
  }

  void addToCart(FoodItem foodItem, {int quantity = 1}) {
    // Check if an item with the same food ID and identical customization options already exists
    int existingIndex = -1;
    for (int i = 0; i < _items.length; i++) {
      if (_items[i].foodItem.id == foodItem.id &&
          _areCustomizationsIdentical(_items[i].foodItem, foodItem)) {
        existingIndex = i;
        break;
      }
    }

    if (existingIndex != -1) {
      _items[existingIndex].quantity += quantity;
    } else {
      _items.add(
        CartItem(
          id: 'cart_${DateTime.now().millisecondsSinceEpoch}',
          foodItem: foodItem.copyWith(), // deep copies groups and options
          quantity: quantity,
        ),
      );
    }

    _shouldAnimateBadge = true;
    notifyListeners();
  }

  void removeFromCart(String cartItemId) {
    _items.removeWhere((item) => item.id == cartItemId);
    _shouldAnimateBadge = true;

    // Recalculate coupon eligibility
    if (_appliedCoupon != null && subtotal < _appliedCoupon!.minOrderValue) {
      _appliedCoupon = null;
    }

    notifyListeners();
  }

  void updateQuantity(String cartItemId, int newQuantity) {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    final index = _items.indexWhere((item) => item.id == cartItemId);
    if (index != -1) {
      _items[index].quantity = newQuantity;
      _shouldAnimateBadge = true;

      // Recalculate coupon eligibility
      if (_appliedCoupon != null && subtotal < _appliedCoupon!.minOrderValue) {
        _appliedCoupon = null;
      }

      notifyListeners();
    }
  }

  bool applyCoupon(Coupon coupon) {
    if (subtotal >= coupon.minOrderValue) {
      _appliedCoupon = coupon;
      notifyListeners();
      return true;
    }
    return false;
  }

  void removeCoupon() {
    _appliedCoupon = null;
    notifyListeners();
  }

  void clearCart() {
    _items.clear();
    _appliedCoupon = null;
    _shouldAnimateBadge = false;
    notifyListeners();
  }

  double get subtotal {
    return _items.fold(0.0, (sum, item) => sum + item.totalPrice);
  }

  double get deliveryFee {
    if (subtotal == 0.0) return 0.0;
    return subtotal > 30.0 ? 0.0 : 2.99; // Free delivery above $30
  }

  double get tax {
    return subtotal * 0.08; // 8% tax
  }

  double get discount {
    if (_appliedCoupon == null) return 0.0;
    return _appliedCoupon!.calculateDiscount(subtotal);
  }

  double get total {
    if (subtotal == 0.0) return 0.0;
    return subtotal + deliveryFee + tax - discount;
  }

  bool _areCustomizationsIdentical(FoodItem item1, FoodItem item2) {
    if (item1.customizationGroups.length != item2.customizationGroups.length) {
      return false;
    }

    for (int i = 0; i < item1.customizationGroups.length; i++) {
      var g1 = item1.customizationGroups[i];
      var g2 = item2.customizationGroups[i];
      if (g1.title != g2.title) return false;

      for (int j = 0; j < g1.options.length; j++) {
        if (g1.options[j].name != g2.options[j].name ||
            g1.options[j].isSelected != g2.options[j].isSelected) {
          return false;
        }
      }
    }
    return true;
  }
}
