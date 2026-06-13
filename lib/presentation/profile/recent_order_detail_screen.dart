import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/colors.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/order.dart';
import '../../state/order_state.dart';

class RecentOrderDetailScreen extends StatefulWidget {
  final OrderModel order;

  const RecentOrderDetailScreen({super.key, required this.order});

  @override
  State<RecentOrderDetailScreen> createState() => _RecentOrderDetailScreenState();
}

class _RecentOrderDetailScreenState extends State<RecentOrderDetailScreen> {
  double _reviewRating = 5.0;
  final _reviewCommentController = TextEditingController();
  bool _isSubmittingReview = false;

  @override
  void dispose() {
    _reviewCommentController.dispose();
    super.dispose();
  }

  Widget _buildStarSelector(double currentRating, Function(double) onRatingChanged, bool isDark) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(5, (index) {
        final starValue = index + 1.0;
        final isSelected = starValue <= currentRating;
        return IconButton(
          icon: Icon(
            isSelected ? Icons.star_rounded : Icons.star_outline_rounded,
            color: isSelected ? Colors.amber : (isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary),
            size: 36,
          ),
          onPressed: () => onRatingChanged(starValue),
        );
      }),
    );
  }

  Widget _buildSavedReview(CustomerReview review, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.success.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Your Review',
                style: AppTypography.outfit(fontWeight: FontWeight.bold, fontSize: 14),
              ),
              Row(
                children: List.generate(5, (index) {
                  final starValue = index + 1.0;
                  return Icon(
                    starValue <= review.rating ? Icons.star_rounded : Icons.star_outline_rounded,
                    color: Colors.amber,
                    size: 18,
                  );
                }),
              ),
            ],
          ),
          if (review.comment.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              review.comment,
              style: AppTypography.inter(
                style: const TextStyle(fontStyle: FontStyle.italic),
                fontSize: 13,
                color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildReviewForm(OrderModel order, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _buildStarSelector(_reviewRating, (val) {
            setState(() => _reviewRating = val);
          }, isDark),
          const SizedBox(height: 12),
          TextFormField(
            controller: _reviewCommentController,
            maxLines: 2,
            style: AppTypography.inter(
              color: isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary,
            ),
            decoration: InputDecoration(
              hintText: 'Tell us what you liked or how we can improve...',
              hintStyle: AppTypography.inter(
                fontSize: 13,
                color: isDark ? AppColors.darkTextSecondary.withOpacity(0.7) : AppColors.lightTextSecondary.withOpacity(0.7),
              ),
              filled: true,
              fillColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(
                  color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                ),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide(
                  color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                ),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: AppColors.primary),
              ),
            ),
          ),
          const SizedBox(height: 12),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              padding: const EdgeInsets.symmetric(vertical: 12),
            ),
            onPressed: _isSubmittingReview ? null : () => _submitReview(order),
            child: _isSubmittingReview
                ? const SizedBox(
                    height: 16,
                    width: 16,
                    child: CircularProgressIndicator(
                      color: Colors.white,
                      strokeWidth: 2,
                    ),
                  )
                : Text(
                    'Submit Review',
                    style: AppTypography.outfit(fontWeight: FontWeight.bold),
                  ),
          ),
        ],
      ),
    );
  }

  Future<void> _submitReview(OrderModel order) async {
    setState(() => _isSubmittingReview = true);
    try {
      await Provider.of<OrderState>(context, listen: false).submitOrderReview(
        orderId: order.id,
        branchId: order.branchId,
        rating: _reviewRating,
        comment: _reviewCommentController.text.trim(),
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Review submitted successfully! Thank you.'),
            backgroundColor: AppColors.success,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to submit review: $e'),
            backgroundColor: AppColors.danger,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmittingReview = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final orderState = Provider.of<OrderState>(context);
    final updatedOrder = orderState.orders.firstWhere(
      (element) => element.id == widget.order.id,
      orElse: () => widget.order,
    );

    final formattedDate = '${updatedOrder.orderDate.day}/${updatedOrder.orderDate.month}/${updatedOrder.orderDate.year}';

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Order Receipt',
          style: AppTypography.outfit(fontWeight: FontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Status Banner
            Container(
              padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
              decoration: BoxDecoration(
                color: AppColors.success.withOpacity(0.08),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.success.withOpacity(0.2)),
              ),
              child: Column(
                children: [
                  const Icon(Icons.check_circle_rounded, color: AppColors.success, size: 48),
                  const SizedBox(height: 12),
                  Text(
                    'Order Delivered Successfully',
                    style: AppTypography.outfit(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      color: AppColors.success,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Delivered on $formattedDate',
                    style: AppTypography.inter(
                      color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Order items list
            Text(
              'Itemized Summary',
              style: AppTypography.outfit(
                style: theme.textTheme.titleMedium,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                ),
              ),
              child: Column(
                children: [
                  ...updatedOrder.items.map((item) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12.0),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  '${item.quantity}x ${item.foodItem.name}',
                                  style: AppTypography.outfit(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 14,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  item.customizationSummary,
                                  style: AppTypography.inter(
                                    color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Text(
                            '₹${item.totalPrice.toStringAsFixed(2)}',
                            style: AppTypography.inter(
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                  const SizedBox(height: 8),
                  Divider(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
                  const SizedBox(height: 8),
                  _buildReceiptRow('Subtotal', updatedOrder.subtotal, isDark),
                  const SizedBox(height: 8),
                  _buildReceiptRow('Delivery Fee', updatedOrder.deliveryFee, isDark),
                  const SizedBox(height: 8),
                  _buildReceiptRow('Taxes (8%)', updatedOrder.tax, isDark),
                  if (updatedOrder.discount > 0) ...[
                    const SizedBox(height: 8),
                    _buildReceiptRow('Discount Applied', -updatedOrder.discount, isDark, isPromo: true),
                  ],
                  const SizedBox(height: 12),
                  Divider(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Total Paid',
                        style: AppTypography.outfit(
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                        ),
                      ),
                      Text(
                        '₹${updatedOrder.total.toStringAsFixed(2)}',
                        style: AppTypography.outfit(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          color: AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Delivery and Payment info
            Text(
              'Delivery Details',
              style: AppTypography.outfit(
                style: theme.textTheme.titleMedium,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                ),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      const Icon(Icons.location_on_rounded, color: AppColors.primary, size: 20),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              updatedOrder.deliveryAddress.title,
                              style: AppTypography.outfit(fontWeight: FontWeight.bold, fontSize: 13),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              updatedOrder.deliveryAddress.addressLine,
                              style: AppTypography.inter(
                                fontSize: 11,
                                color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      const Icon(Icons.payment_rounded, color: AppColors.primary, size: 20),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Payment Method',
                              style: AppTypography.outfit(fontWeight: FontWeight.bold, fontSize: 13),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${updatedOrder.paymentMethod} • ${updatedOrder.paymentStatus}',
                              style: AppTypography.inter(
                                fontSize: 11,
                                color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Review Section
            if (updatedOrder.status == 'Delivered') ...[
              Text(
                'Rate your Experience',
                style: AppTypography.outfit(
                  style: theme.textTheme.titleMedium,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 12),
              updatedOrder.customerReview != null
                  ? _buildSavedReview(updatedOrder.customerReview!, isDark)
                  : _buildReviewForm(updatedOrder, isDark),
              const SizedBox(height: 24),
            ],
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildReceiptRow(String label, double val, bool isDark, {bool isPromo = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: AppTypography.inter(
            color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
            fontSize: 12,
          ),
        ),
        Text(
          isPromo ? '-₹${(-val).toStringAsFixed(2)}' : '₹${val.toStringAsFixed(2)}',
          style: AppTypography.inter(
            color: isPromo ? AppColors.success : (isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary),
            fontWeight: isPromo ? FontWeight.bold : FontWeight.normal,
            fontSize: 12,
          ),
        ),
      ],
    );
  }
}
