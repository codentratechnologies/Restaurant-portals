class CustomizationOption {
  final String name;
  final double additionalPrice;
  bool isSelected;

  CustomizationOption({
    required this.name,
    this.additionalPrice = 0.0,
    this.isSelected = false,
  });

  CustomizationOption copy() {
    return CustomizationOption(
      name: name,
      additionalPrice: additionalPrice,
      isSelected: isSelected,
    );
  }
}

class CustomizationGroup {
  final String title;
  final bool isRequired;
  final bool isMultiSelect;
  final List<CustomizationOption> options;

  CustomizationGroup({
    required this.title,
    this.isRequired = false,
    this.isMultiSelect = false,
    required this.options,
  });

  CustomizationGroup copy() {
    return CustomizationGroup(
      title: title,
      isRequired: isRequired,
      isMultiSelect: isMultiSelect,
      options: options.map((e) => e.copy()).toList(),
    );
  }
}

class FoodItem {
  final String id;
  final String name;
  final String description;
  final double basePrice;
  final String imageUrl;
  final double rating;
  final int reviewsCount;
  final String category;
  final bool isVeg;
  final List<CustomizationGroup> customizationGroups;

  FoodItem({
    required this.id,
    required this.name,
    required this.description,
    required this.basePrice,
    required this.imageUrl,
    required this.rating,
    required this.reviewsCount,
    required this.category,
    required this.isVeg,
    required this.customizationGroups,
  });

  FoodItem copyWith({
    String? id,
    String? name,
    String? description,
    double? basePrice,
    String? imageUrl,
    double? rating,
    int? reviewsCount,
    String? category,
    bool? isVeg,
    List<CustomizationGroup>? customizationGroups,
  }) {
    return FoodItem(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      basePrice: basePrice ?? this.basePrice,
      imageUrl: imageUrl ?? this.imageUrl,
      rating: rating ?? this.rating,
      reviewsCount: reviewsCount ?? this.reviewsCount,
      category: category ?? this.category,
      isVeg: isVeg ?? this.isVeg,
      customizationGroups: customizationGroups ?? this.customizationGroups.map((e) => e.copy()).toList(),
    );
  }
}
