import 'food_item.dart';

class CartItem {
  final String id;
  final FoodItem foodItem;
  int quantity;

  CartItem({
    required this.id,
    required this.foodItem,
    this.quantity = 1,
  });

  double get unitPrice {
    double total = foodItem.basePrice;
    for (var group in foodItem.customizationGroups) {
      for (var option in group.options) {
        if (option.isSelected) {
          total += option.additionalPrice;
        }
      }
    }
    return total;
  }

  double get totalPrice => unitPrice * quantity;

  String get customizationSummary {
    List<String> summary = [];
    for (var group in foodItem.customizationGroups) {
      for (var option in group.options) {
        if (option.isSelected) {
          summary.add(option.name);
        }
      }
    }
    return summary.isEmpty ? 'Regular' : summary.join(', ');
  }

  CartItem copyWith({
    String? id,
    FoodItem? foodItem,
    int? quantity,
  }) {
    return CartItem(
      id: id ?? this.id,
      foodItem: foodItem ?? this.foodItem.copyWith(),
      quantity: quantity ?? this.quantity,
    );
  }
}
