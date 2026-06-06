import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/colors.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/elastic_button.dart';
import '../../core/widgets/page_transitions.dart';
import '../../state/order_state.dart';
import '../../state/cart_state.dart';
import 'recent_order_detail_screen.dart';
import '../order/order_detail_screen.dart';

class RecentOrdersScreen extends StatelessWidget {
  final bool showBackButton;

  const RecentOrdersScreen({super.key, this.showBackButton = true});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final orderState = Provider.of<OrderState>(context);
    final cartState = Provider.of<CartState>(context, listen: false);
    final orders = orderState.orders;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'My Orders',
          style: AppTypography.outfit(fontWeight: FontWeight.bold),
        ),
        leading: showBackButton
            ? IconButton(
                icon: const Icon(Icons.arrow_back_ios_new_rounded),
                onPressed: () => Navigator.of(context).pop(),
              )
            : null,
      ),
      body: orders.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.history_rounded,
                    size: 64,
                    color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'No orders placed yet',
                    style: AppTypography.outfit(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(20.0),
              itemCount: orders.length,
              itemBuilder: (context, index) {
                final order = orders[index];
                final formattedDate = '${order.orderDate.day}/${order.orderDate.month}/${order.orderDate.year}';

                return Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            order.id,
                            style: AppTypography.outfit(
                              fontWeight: FontWeight.bold,
                              fontSize: 15,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: _getStatusColor(order.status).withOpacity(0.12),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              order.status,
                              style: AppTypography.outfit(
                                color: _getStatusColor(order.status),
                                fontWeight: FontWeight.bold,
                                fontSize: 11,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        formattedDate,
                        style: AppTypography.inter(
                          color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Divider(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
                      const SizedBox(height: 12),
                      // Items summary
                      Text(
                        order.items.map((e) => '${e.quantity}x ${e.foodItem.name}').join(', '),
                        style: AppTypography.inter(
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Total Paid: ₹${order.total.toStringAsFixed(2)}',
                            style: AppTypography.outfit(
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                              color: AppColors.primary,
                            ),
                          ),
                          Row(
                            children: [
                              // View details
                              TextButton(
                                onPressed: () {
                                  if (order.status != 'Delivered') {
                                    orderState.selectActiveOrder(order);
                                    Navigator.push(
                                      context,
                                      SlidePageRoute(page: OrderDetailScreen(order: order)),
                                    );
                                  } else {
                                    Navigator.push(
                                      context,
                                      SlidePageRoute(page: RecentOrderDetailScreen(order: order)),
                                    );
                                  }
                                },
                                style: TextButton.styleFrom(
                                  foregroundColor: AppColors.primary,
                                  padding: const EdgeInsets.symmetric(horizontal: 12),
                                ),
                                child: Text(
                                  order.status == 'Delivered' ? 'Details' : 'Track',
                                  style: AppTypography.outfit(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              // Reorder button
                              ElasticButton(
                                onTap: () {
                                  for (var item in order.items) {
                                    cartState.addToCart(item.foodItem, quantity: item.quantity);
                                  }
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text('Items added to cart!'),
                                      backgroundColor: AppColors.success,
                                    ),
                                  );
                                },
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                  decoration: BoxDecoration(
                                    color: AppColors.primary,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    'Reorder',
                                    style: AppTypography.outfit(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      )
                    ],
                  ),
                );
              },
            ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'Placed':
        return AppColors.warning;
      case 'Preparing':
        return Colors.blue;
      case 'Out for Delivery':
        return AppColors.primary;
      case 'Delivered':
        return AppColors.success;
      default:
        return AppColors.lightTextSecondary;
    }
  }
}
