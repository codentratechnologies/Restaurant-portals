import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/colors.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/elastic_button.dart';
import '../../core/widgets/page_transitions.dart';
import '../../data/mock/mock_database.dart';
import '../../state/cart_state.dart';
import '../../state/branch_state.dart';
import '../food/food_detail_screen.dart';

class FoodCollectionScreen extends StatelessWidget {
  const FoodCollectionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final cartState = Provider.of<CartState>(context, listen: false);

    final favorites = MockDatabase.foodItems.take(3).toList();

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'My Collections',
          style: AppTypography.outfit(fontWeight: FontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: favorites.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.favorite_border_rounded,
                    size: 64,
                    color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'No favorites collected yet',
                    style: AppTypography.outfit(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                    ),
                  ),
                ],
              ),
            )
          : ListView.builder(
        padding: const EdgeInsets.all(20.0),
        itemCount: favorites.length,
        itemBuilder: (context, index) {
          final item = favorites[index];

          return GestureDetector(
            onTap: () {
              Navigator.push(
                context,
                SlidePageRoute(page: FoodDetailScreen(foodItem: item)),
              );
            },
            child: Container(
              margin: const EdgeInsets.only(bottom: 16),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                ),
              ),
              child: Row(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Image.network(
                      item.imageUrl,
                      width: 80,
                      height: 80,
                      fit: BoxFit.cover,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(2.0),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(4),
                                border: Border.all(
                                  color: item.isVeg ? AppColors.success : AppColors.danger,
                                  width: 1.2,
                                ),
                              ),
                              child: Container(
                                width: 4,
                                height: 4,
                                decoration: BoxDecoration(
                                  color: item.isVeg ? AppColors.success : AppColors.danger,
                                  shape: BoxShape.circle,
                                ),
                              ),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              item.category,
                              style: AppTypography.outfit(
                                color: AppColors.primary,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          item.name,
                          style: AppTypography.outfit(
                            fontWeight: FontWeight.bold,
                            fontSize: 15,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '₹${item.basePrice.toStringAsFixed(2)}',
                          style: AppTypography.inter(
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                            color: AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Builder(
                    builder: (context) {
                      final branchState = Provider.of<BranchState>(context, listen: false);
                      final isAvailable = branchState.selectedBranch?.isItemAvailable(item.id) ?? true;

                      return ElasticButton(
                        onTap: !isAvailable
                            ? () {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text('${item.name} is not available at this branch.'),
                                    backgroundColor: AppColors.danger,
                                  ),
                                );
                              }
                            : () {
                                if (item.customizationGroups.isEmpty) {
                                  cartState.addToCart(item);
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text('${item.name} added to cart!'),
                                      duration: const Duration(seconds: 1),
                                      backgroundColor: AppColors.success,
                                    ),
                                  );
                                } else {
                                  Navigator.push(
                                    context,
                                    SlidePageRoute(page: FoodDetailScreen(foodItem: item)),
                                  );
                                }
                              },
                        child: Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: isAvailable
                                ? AppColors.primary.withOpacity(0.12)
                                : (isDark ? AppColors.darkBorder : AppColors.lightBorder),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(
                            Icons.add_shopping_cart_rounded,
                            color: isAvailable
                                ? AppColors.primary
                                : (isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary),
                            size: 20,
                          ),
                        ),
                      );
                    }
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
