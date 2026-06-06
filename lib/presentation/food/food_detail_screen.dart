import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/colors.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/elastic_button.dart';
import '../../data/models/food_item.dart';
import '../../state/cart_state.dart';
import 'food_customization_screen.dart';

class FoodDetailScreen extends StatefulWidget {
  final FoodItem foodItem;

  const FoodDetailScreen({super.key, required this.foodItem});

  @override
  State<FoodDetailScreen> createState() => _FoodDetailScreenState();
}

class _FoodDetailScreenState extends State<FoodDetailScreen> {
  late FoodItem _customizableFoodItem;
  bool _isFavorite = false;

  @override
  void initState() {
    super.initState();
    // Create a copy of the food item to store temporary customization selections
    _customizableFoodItem = widget.foodItem.copyWith();
  }

  void _openCustomizationSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return FoodCustomizationScreen(
          foodItem: _customizableFoodItem,
          onComplete: (customizedItem) {
            setState(() {
              _customizableFoodItem = customizedItem;
            });
            // Automatically add to cart after customization selection
            Provider.of<CartState>(context, listen: false).addToCart(_customizableFoodItem);
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('${widget.foodItem.name} added to cart!'),
                backgroundColor: AppColors.success,
                duration: const Duration(seconds: 1),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final cartState = Provider.of<CartState>(context, listen: false);

    return Scaffold(
      body: Stack(
        children: [
          // Content Scroll View
          SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Cover Image
                Stack(
                  children: [
                    Image.network(
                      widget.foodItem.imageUrl,
                      width: double.infinity,
                      height: 300,
                      fit: BoxFit.cover,
                    ),
                    // Shadow overlay
                    Container(
                      height: 300,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            Colors.black.withOpacity(0.4),
                            Colors.transparent,
                            Colors.black.withOpacity(0.2),
                          ],
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                        ),
                      ),
                    ),
                  ],
                ),
                Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Food Name and Category Badge
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(3),
                                      decoration: BoxDecoration(
                                        color: Colors.white,
                                        borderRadius: BorderRadius.circular(4),
                                        border: Border.all(
                                          color: widget.foodItem.isVeg ? AppColors.success : AppColors.danger,
                                          width: 1.5,
                                        ),
                                      ),
                                      child: Container(
                                        width: 5,
                                        height: 5,
                                        decoration: BoxDecoration(
                                          color: widget.foodItem.isVeg ? AppColors.success : AppColors.danger,
                                          shape: BoxShape.circle,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      widget.foodItem.category,
                                      style: AppTypography.outfit(
                                        color: AppColors.primary,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  widget.foodItem.name,
                                  style: AppTypography.outfit(
                                    style: theme.textTheme.headlineMedium,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          // Heart favorite button
                          ElasticButton(
                            onTap: () {
                              setState(() {
                                _isFavorite = !_isFavorite;
                              });
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(_isFavorite ? 'Added to favorites collection!' : 'Removed from favorites'),
                                  duration: const Duration(milliseconds: 800),
                                  backgroundColor: _isFavorite ? AppColors.primary : AppColors.lightTextSecondary,
                                ),
                              );
                            },
                            child: Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: isDark ? AppColors.darkSurface : Colors.white,
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.05),
                                    blurRadius: 4,
                                    offset: const Offset(0, 2),
                                  )
                                ],
                              ),
                              child: Icon(
                                _isFavorite ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                                color: AppColors.danger,
                                size: 22,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      // Stats Row (Delivery Time)
                      Row(
                        children: [
                          const Icon(Icons.delivery_dining_rounded, color: AppColors.primary, size: 20),
                          const SizedBox(width: 6),
                          Text(
                            '25-30 min',
                            style: AppTypography.outfit(
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      Divider(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
                      const SizedBox(height: 16),
                      // Description
                      Text(
                        'Description',
                        style: AppTypography.outfit(
                          style: theme.textTheme.titleMedium,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        widget.foodItem.description,
                        style: AppTypography.inter(
                          color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                          height: 1.5,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 24),
                      // Customization Indicator Box (if customization options exist)
                      if (widget.foodItem.customizationGroups.isNotEmpty)
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withOpacity(0.08),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.primary.withOpacity(0.2)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.tune_rounded, color: AppColors.primary),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Customization Available',
                                      style: AppTypography.outfit(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 14,
                                        color: AppColors.primary,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      'Tap Customize button to add extra cheese, toppings, and select portions.',
                                      style: AppTypography.inter(
                                        fontSize: 12,
                                        color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      const SizedBox(height: 120), // Spacing for floating action button
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Custom Top Header Actions (Floating Back Button)
          Positioned(
            top: 40,
            left: 20,
            child: ElasticButton(
              onTap: () => Navigator.of(context).pop(),
              child: Container(
                padding: const EdgeInsets.all(10),
                decoration: const BoxDecoration(
                  color: Colors.black38,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.arrow_back_ios_new_rounded,
                  color: Colors.white,
                  size: 18,
                ),
              ),
            ),
          ),

          // Bottom Bar containing Price & Add CTA
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkBackground : Colors.white,
                border: Border(
                  top: BorderSide(
                    color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                  ),
                ),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Price',
                          style: AppTypography.inter(
                            color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                            fontSize: 12,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '₹${widget.foodItem.basePrice.toStringAsFixed(2)}',
                          style: AppTypography.outfit(
                            fontWeight: FontWeight.bold,
                            fontSize: 24,
                            color: AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 20),
                  // CTA button
                  Expanded(
                    flex: 2,
                    child: ElasticButton(
                      onTap: () {
                        if (widget.foodItem.customizationGroups.isEmpty) {
                          cartState.addToCart(widget.foodItem);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('${widget.foodItem.name} added to cart!'),
                              duration: const Duration(seconds: 1),
                              backgroundColor: AppColors.success,
                            ),
                          );
                        } else {
                          _openCustomizationSheet();
                        }
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
                            widget.foodItem.customizationGroups.isEmpty ? 'Add To Cart' : 'Customize & Add',
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
          ),
        ],
      ),
    );
  }
}
