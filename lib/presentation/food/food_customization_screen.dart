import 'package:flutter/material.dart';
import '../../core/theme/colors.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/elastic_button.dart';
import '../../data/models/food_item.dart';

class FoodCustomizationScreen extends StatefulWidget {
  final FoodItem foodItem;
  final Function(FoodItem) onComplete;

  const FoodCustomizationScreen({
    super.key,
    required this.foodItem,
    required this.onComplete,
  });

  @override
  State<FoodCustomizationScreen> createState() => _FoodCustomizationScreenState();
}

class _FoodCustomizationScreenState extends State<FoodCustomizationScreen> {
  late FoodItem _customizedItem;

  @override
  void initState() {
    super.initState();
    // Copy the item so edits are local
    _customizedItem = widget.foodItem.copyWith();
  }

  double get _currentTotalPrice {
    double total = _customizedItem.basePrice;
    for (var group in _customizedItem.customizationGroups) {
      for (var option in group.options) {
        if (option.isSelected) {
          total += option.additionalPrice;
        }
      }
    }
    return total;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkBackground : AppColors.lightBackground,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(24),
          topRight: Radius.circular(24),
        ),
      ),
      padding: const EdgeInsets.only(top: 8),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Handle Bar for Sheet dragging indicator
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),
            // Header Title
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Customize',
                          style: AppTypography.outfit(
                            style: theme.textTheme.headlineSmall,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          _customizedItem.name,
                          style: AppTypography.inter(
                            fontSize: 13,
                            color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded),
                    onPressed: () => Navigator.of(context).pop(),
                  )
                ],
              ),
            ),
            const SizedBox(height: 12),
            Divider(color: isDark ? AppColors.darkBorder : AppColors.lightBorder, height: 1),
            
            // Customization Options List
            Flexible(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: _customizedItem.customizationGroups.map((group) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 24.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                group.title,
                                style: AppTypography.outfit(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                              const SizedBox(width: 6),
                              if (group.isRequired)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppColors.primary.withOpacity(0.12),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    'REQUIRED',
                                    style: AppTypography.outfit(
                                      color: AppColors.primary,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 9,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Container(
                            decoration: BoxDecoration(
                              color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                              ),
                            ),
                            child: Column(
                              children: group.options.map((option) {
                                final isOptionSelected = option.isSelected;
                                final priceText = option.additionalPrice > 0
                                    ? '(+₹${option.additionalPrice.toStringAsFixed(2)})'
                                    : 'Free';

                                return group.isMultiSelect
                                    ? CheckboxListTile(
                                        title: Text(
                                          option.name,
                                          style: AppTypography.inter(fontSize: 14),
                                        ),
                                        subtitle: Text(
                                          priceText,
                                          style: AppTypography.inter(
                                            color: AppColors.primary,
                                            fontSize: 12,
                                            fontWeight: FontWeight.w500,
                                          ),
                                        ),
                                        value: isOptionSelected,
                                        activeColor: AppColors.primary,
                                        onChanged: (bool? checked) {
                                          setState(() {
                                            option.isSelected = checked ?? false;
                                          });
                                        },
                                      )
                                    : RadioListTile<String>(
                                        title: Text(
                                          option.name,
                                          style: AppTypography.inter(fontSize: 14),
                                        ),
                                        subtitle: Text(
                                          priceText,
                                          style: AppTypography.inter(
                                            color: AppColors.primary,
                                            fontSize: 12,
                                            fontWeight: FontWeight.w500,
                                          ),
                                        ),
                                        value: option.name,
                                        groupValue: group.options.firstWhere((e) => e.isSelected, orElse: () => group.options.first).name,
                                        activeColor: AppColors.primary,
                                        onChanged: (String? val) {
                                          setState(() {
                                            for (var opt in group.options) {
                                              opt.isSelected = opt.name == val;
                                            }
                                          });
                                        },
                                      );
                              }).toList(),
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),
            ),
            Divider(color: isDark ? AppColors.darkBorder : AppColors.lightBorder, height: 1),
            
            // Bottom Action Drawer (Price + Add button)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Total Price',
                          style: AppTypography.inter(
                            color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                            fontSize: 12,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '₹${_currentTotalPrice.toStringAsFixed(2)}',
                          style: AppTypography.outfit(
                            fontWeight: FontWeight.bold,
                            fontSize: 22,
                            color: AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    flex: 2,
                    child: ElasticButton(
                      onTap: () {
                        // Return customized item
                        widget.onComplete(_customizedItem);
                        Navigator.of(context).pop();
                      },
                      child: Container(
                        height: 56,
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primary.withOpacity(0.3),
                              blurRadius: 16,
                              offset: const Offset(0, 8),
                            )
                          ],
                        ),
                        child: Center(
                          child: Text(
                            'Add to Cart',
                            style: AppTypography.outfit(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
