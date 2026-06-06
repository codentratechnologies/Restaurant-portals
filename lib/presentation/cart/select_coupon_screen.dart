import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/colors.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/elastic_button.dart';
import '../../data/mock/mock_database.dart';
import '../../data/models/coupon.dart';
import '../../state/cart_state.dart';
import '../../state/order_state.dart';

class SelectCouponScreen extends StatelessWidget {
  const SelectCouponScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final cartState = Provider.of<CartState>(context);
    final orderState = Provider.of<OrderState>(context);

    // Identify which coupons have been used in past orders
    final usedCouponCodes = orderState.orders
        .map((o) => o.couponApplied?.code)
        .where((code) => code != null && code.isNotEmpty)
        .cast<String>()
        .toSet();

    final List<Coupon> availableCoupons = [];
    final List<Coupon> usedCoupons = [];
    final List<Coupon> expiredCoupons = [];

    for (final coupon in MockDatabase.coupons) {
      if (usedCouponCodes.contains(coupon.code)) {
        usedCoupons.add(coupon);
      } else if (coupon.isExpired) {
        expiredCoupons.add(coupon);
      } else {
        availableCoupons.add(coupon);
      }
    }

    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: Text(
            'Apply Coupon',
            style: AppTypography.outfit(fontWeight: FontWeight.bold),
          ),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded),
            onPressed: () => Navigator.of(context).pop(false),
          ),
          bottom: TabBar(
            tabs: const [
              Tab(text: 'Available'),
              Tab(text: 'Used'),
              Tab(text: 'Expired'),
            ],
            labelStyle: AppTypography.outfit(fontWeight: FontWeight.bold, fontSize: 13),
            unselectedLabelStyle: AppTypography.outfit(fontWeight: FontWeight.normal, fontSize: 13),
            indicatorColor: AppColors.primary,
            labelColor: AppColors.primary,
            unselectedLabelColor: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
          ),
        ),
        body: TabBarView(
          children: [
            _buildCouponList(context, availableCoupons, cartState, isDark, category: 'available'),
            _buildCouponList(context, usedCoupons, cartState, isDark, category: 'used'),
            _buildCouponList(context, expiredCoupons, cartState, isDark, category: 'expired'),
          ],
        ),
      ),
    );
  }

  Widget _buildCouponList(
    BuildContext context,
    List<Coupon> coupons,
    CartState cartState,
    bool isDark, {
    required String category,
  }) {
    if (coupons.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              category == 'available'
                  ? Icons.local_offer_outlined
                  : category == 'used'
                      ? Icons.check_circle_outline_rounded
                      : Icons.history_toggle_off_rounded,
              size: 56,
              color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
            ),
            const SizedBox(height: 16),
            Text(
              category == 'available'
                  ? 'No coupons available right now'
                  : category == 'used'
                      ? 'No used coupons yet'
                      : 'No expired coupons',
              style: AppTypography.outfit(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
              ),
            ),
          ],
        ),
      );
    }

    final currentSubtotal = cartState.subtotal;

    return ListView.builder(
      padding: const EdgeInsets.all(20.0),
      itemCount: coupons.length,
      itemBuilder: (context, index) {
        final coupon = coupons[index];
        final isEligible = currentSubtotal >= coupon.minOrderValue;
        
        final bool isAvailableTab = category == 'available';
        final bool isUsedTab = category == 'used';
        final bool isExpiredTab = category == 'expired';

        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isAvailableTab && isEligible
                  ? AppColors.primary.withOpacity(0.4)
                  : isDark
                      ? AppColors.darkBorder
                      : AppColors.lightBorder,
              width: isAvailableTab && isEligible ? 1.5 : 1.0,
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
                      color: isAvailableTab && isEligible
                          ? AppColors.primary.withOpacity(0.12)
                          : (isDark ? AppColors.darkBorder : AppColors.lightBorder),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      coupon.code,
                      style: AppTypography.outfit(
                        color: isAvailableTab && isEligible
                            ? AppColors.primary
                            : (isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary),
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  ),
                  if (isAvailableTab)
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
                    )
                  else if (isUsedTab)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.success.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppColors.success.withOpacity(0.3)),
                      ),
                      child: Text(
                        'Used',
                        style: AppTypography.outfit(
                          color: AppColors.success,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    )
                  else // ExpiredTab
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: AppColors.danger.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppColors.danger.withOpacity(0.3)),
                      ),
                      child: Text(
                        'Expired',
                        style: AppTypography.outfit(
                          color: AppColors.danger,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                coupon.displayDescription,
                style: AppTypography.inter(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: isExpiredTab
                      ? (isDark ? AppColors.darkTextSecondary.withOpacity(0.6) : AppColors.lightTextSecondary.withOpacity(0.6))
                      : (isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary),
                ),
              ),
              const SizedBox(height: 8),
              if (isAvailableTab)
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
                            : 'Add ₹${(coupon.minOrderValue - currentSubtotal).toStringAsFixed(2)} more to unlock.',
                        style: AppTypography.inter(
                          color: isEligible ? AppColors.success : AppColors.danger,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ],
                )
              else if (isUsedTab)
                Row(
                  children: [
                    const Icon(
                      Icons.check_circle_rounded,
                      color: AppColors.success,
                      size: 14,
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        'You successfully used this coupon code.',
                        style: AppTypography.inter(
                          color: AppColors.success,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ],
                )
              else // isExpiredTab
                Row(
                  children: [
                    const Icon(
                      Icons.error_outline_rounded,
                      color: AppColors.danger,
                      size: 14,
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        coupon.validUntil.isNotEmpty
                            ? 'Offer expired on ${coupon.validUntil}'
                            : 'This coupon is no longer active.',
                        style: AppTypography.inter(
                          color: AppColors.danger,
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
    );
  }
}

