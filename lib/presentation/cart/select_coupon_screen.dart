import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/colors.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/elastic_button.dart';
import '../../data/mock/mock_database.dart';
import '../../state/cart_state.dart';

class SelectCouponScreen extends StatelessWidget {
  const SelectCouponScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final cartState = Provider.of<CartState>(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Apply Coupon',
          style: AppTypography.outfit(fontWeight: FontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.of(context).pop(false),
        ),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(20.0),
        itemCount: MockDatabase.coupons.length,
        itemBuilder: (context, index) {
          final coupon = MockDatabase.coupons[index];
          final currentSubtotal = cartState.subtotal;
          final isEligible = currentSubtotal >= coupon.minOrderValue;

          return Container(
            margin: const EdgeInsets.only(bottom: 16),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isEligible
                    ? AppColors.primary.withOpacity(0.4)
                    : isDark
                        ? AppColors.darkBorder
                        : AppColors.lightBorder,
                width: isEligible ? 1.5 : 1.0,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: isEligible ? AppColors.primary.withOpacity(0.12) : (isDark ? AppColors.darkBorder : AppColors.lightBorder),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        coupon.code,
                        style: AppTypography.outfit(
                          color: isEligible ? AppColors.primary : (isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary),
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                    ),
                    ElasticButton(
                      onTap: isEligible
                          ? () {
                              cartState.applyCoupon(coupon);
                              Navigator.of(context).pop(true);
                            }
                          : null,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: isEligible ? AppColors.primary : Colors.transparent,
                          borderRadius: BorderRadius.circular(10),
                          border: isEligible ? null : Border.all(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
                        ),
                        child: Text(
                          isEligible ? 'Apply' : 'Locked',
                          style: AppTypography.outfit(
                            color: isEligible ? Colors.white : (isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary),
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  coupon.description,
                  style: AppTypography.inter(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Icon(
                      isEligible ? Icons.check_circle_rounded : Icons.info_outline_rounded,
                      color: isEligible ? AppColors.success : AppColors.danger,
                      size: 14,
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        isEligible
                            ? 'Yay! You are eligible for this coupon.'
                            : 'Add \$${(coupon.minOrderValue - currentSubtotal).toStringAsFixed(2)} more to unlock.',
                        style: AppTypography.inter(
                          color: isEligible ? AppColors.success : AppColors.danger,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
