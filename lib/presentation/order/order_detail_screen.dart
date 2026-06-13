import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/colors.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/order.dart';
import '../../state/order_state.dart';

class OrderDetailScreen extends StatefulWidget {
  final OrderModel order;

  const OrderDetailScreen({super.key, required this.order});

  @override
  State<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends State<OrderDetailScreen> {
  Timer? _pollTimer;
  bool _isSyncing = false;
  double _reviewRating = 5.0;
  final _reviewCommentController = TextEditingController();
  bool _isSubmittingReview = false;

  @override
  void initState() {
    super.initState();
    // Immediately fetch the latest status on screen open
    _pollStatus();
    // Then poll every 15 seconds
    _pollTimer = Timer.periodic(const Duration(seconds: 15), (_) => _pollStatus());
  }

  Future<void> _pollStatus() async {
    if (!mounted) return;
    setState(() => _isSyncing = true);
    await Provider.of<OrderState>(context, listen: false)
        .fetchAndUpdateOrderStatus(widget.order.id);
    if (mounted) setState(() => _isSyncing = false);
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _reviewCommentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Track Order',
          style: AppTypography.outfit(fontWeight: FontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: _isSyncing
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(
                      color: AppColors.primary,
                      strokeWidth: 2,
                    ),
                  )
                : Row(
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: AppColors.success,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        'Live',
                        style: AppTypography.outfit(
                          color: AppColors.success,
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
          ),
        ],
      ),
      body: Consumer<OrderState>(
        builder: (context, orderState, child) {
          // Fetch the latest version of this order from state (auto-updated by polling)
          final updatedOrder = orderState.orders.firstWhere(
            (element) => element.id == widget.order.id,
            orElse: () => widget.order,
          );

          return RefreshIndicator(
            color: AppColors.primary,
            onRefresh: () => orderState.loadOrders(),
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Order ID card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'ORDER ID',
                              style: AppTypography.inter(
                                color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              updatedOrder.id,
                              style: AppTypography.outfit(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                          ],
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              'STATUS',
                              style: AppTypography.inter(
                                color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: _getStatusColor(updatedOrder.status).withOpacity(0.15),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                _getFriendlyStatusLabel(updatedOrder.status),
                                style: AppTypography.outfit(
                                  color: _getStatusColor(updatedOrder.status),
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Live Timeline tracker
                  Text(
                    'Delivery Timeline',
                    style: AppTypography.outfit(
                      style: theme.textTheme.titleMedium,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  _buildTimeline(updatedOrder.status, isDark),
                  const SizedBox(height: 32),

                  // Ordered Items
                  Text(
                    'Items Ordered',
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
                        }),
                        const SizedBox(height: 8),
                        Divider(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
                        const SizedBox(height: 8),
                        _buildReceiptRow('Subtotal', updatedOrder.subtotal, isDark),
                        const SizedBox(height: 8),
                        _buildReceiptRow('Delivery Fee', updatedOrder.deliveryFee, isDark),
                        const SizedBox(height: 8),
                        _buildReceiptRow('Taxes', updatedOrder.tax, isDark),
                        if (updatedOrder.discount > 0) ...[
                          const SizedBox(height: 8),
                          _buildReceiptRow('Discount', -updatedOrder.discount, isDark, isPromo: true),
                        ],
                        const SizedBox(height: 12),
                        Divider(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Grand Total',
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

                  // Delivery address and Payment Info
                  Text(
                    'Delivery Address',
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
                    child: Row(
                      children: [
                        const Icon(Icons.location_on_rounded, color: AppColors.primary, size: 24),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                updatedOrder.deliveryAddress.title,
                                style: AppTypography.outfit(fontWeight: FontWeight.bold, fontSize: 14),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                updatedOrder.deliveryAddress.addressLine,
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
                  const SizedBox(height: 16),
                  Text(
                    'Payment Details',
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
                    child: Row(
                      children: [
                        const Icon(Icons.payment_rounded, color: AppColors.primary, size: 24),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Payment Method',
                                style: AppTypography.outfit(fontWeight: FontWeight.bold, fontSize: 14),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '${updatedOrder.paymentMethod} • ${updatedOrder.paymentStatus}',
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
                  const SizedBox(height: 24),

                  if (updatedOrder.deliveryPartnerName != null) ...[
                    Text(
                      'Delivery Partner',
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
                      child: Row(
                        children: [
                          const Icon(Icons.delivery_dining_rounded, color: AppColors.primary, size: 28),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  updatedOrder.deliveryPartnerName!,
                                  style: AppTypography.outfit(fontWeight: FontWeight.bold, fontSize: 16),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  'Mobile: ${updatedOrder.deliveryPartnerMobile ?? 'N/A'}',
                                  style: AppTypography.inter(
                                    fontSize: 13,
                                    color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          if (updatedOrder.otp != null)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              decoration: BoxDecoration(
                                color: AppColors.primary.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Column(
                                children: [
                                  Text(
                                    'OTP',
                                    style: AppTypography.inter(
                                      fontSize: 10,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.primary,
                                    ),
                                  ),
                                  Text(
                                    updatedOrder.otp!,
                                    style: AppTypography.outfit(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 18,
                                      color: AppColors.primary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],
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
                  // Auto-refresh hint
                  Center(
                    child: Text(
                      'Status updates automatically every 15 seconds',
                      style: AppTypography.inter(
                        fontSize: 11,
                        color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                      ),
                    ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
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
      case 'Assigned':
        return Colors.orange;
      case 'Arrived Store':
        return Colors.deepOrange;
      case 'Out for Delivery':
        return AppColors.primary;
      case 'Arrived Customer':
        return Colors.indigo;
      case 'Delivered':
        return AppColors.success;
      default:
        return AppColors.lightTextSecondary;
    }
  }

  /// Returns a customer-friendly label for any order status string.
  String _getFriendlyStatusLabel(String status) {
    switch (status.trim()) {
      case 'Placed':
        return 'Placed';
      case 'Preparing':
        return 'Preparing';
      case 'Assigned':
        return 'Preparing'; // Driver assigned → customer sees "Preparing"
      case 'Arrived Store':
        return 'Preparing'; // Driver at store → customer sees "Preparing"
      case 'Out for Delivery':
        return 'Out for Delivery';
      case 'Arrived Customer':
        return 'Out for Delivery'; // Driver at door → customer sees "Out for Delivery"
      case 'Delivered':
        return 'Delivered';
      default:
        return status;
    }
  }

  /// Maps any status string (from customer or delivery app) to a timeline index.
  /// Timeline steps: 0=Placed, 1=Preparing/Assigned, 2=Out for Delivery, 3=Delivered
  int _statusToTimelineIndex(String status) {
    switch (status.trim()) {
      case 'Placed':
        return 0;
      case 'Preparing':
        return 1;
      case 'Assigned':
        return 1; // Driver accepted → still in "Preparing" stage for customer
      case 'Arrived Store':
        return 1; // Driver at restaurant → still "Preparing" from customer view
      case 'Out for Delivery':
        return 2;
      case 'Arrived Customer':
        return 2; // Driver at door → still "Out for Delivery" from customer view
      case 'Delivered':
        return 3;
      default:
        return 0; // Default to "Placed" for unknown statuses
    }
  }

  Widget _buildTimeline(String currentStatus, bool isDark) {
    final steps = ['Placed', 'Preparing', 'Out for Delivery', 'Delivered'];
    final descriptions = [
      'Your order has been received by restaurant.',
      'Chef is preparing your fresh meal now.',
      'Delivery partner is bringing your hot food.',
      'Order completed! Enjoy your delicious meal!'
    ];

    int currentIndex = _statusToTimelineIndex(currentStatus);

    return Column(
      children: List.generate(steps.length, (index) {
        final step = steps[index];
        final isDone = index <= currentIndex;
        final isCurrent = index == currentIndex;

        return Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Line and dot
            Column(
              children: [
                Container(
                  width: 20,
                  height: 20,
                  decoration: BoxDecoration(
                    color: isDone ? _getStatusColor(step) : (isDark ? AppColors.darkBorder : AppColors.lightBorder),
                    shape: BoxShape.circle,
                    border: isCurrent
                        ? Border.all(
                            color: isDark ? Colors.white : Colors.black87,
                            width: 2.5,
                          )
                        : null,
                  ),
                  child: isDone && !isCurrent
                      ? const Icon(Icons.check, color: Colors.white, size: 12)
                      : null,
                ),
                if (index < steps.length - 1)
                  Container(
                    width: 3,
                    height: 48,
                    color: index < currentIndex
                        ? _getStatusColor(steps[index + 1])
                        : isDark
                            ? AppColors.darkBorder
                            : AppColors.lightBorder,
                  ),
              ],
            ),
            const SizedBox(width: 16),
            // Text detail
            Expanded(
              child: Padding(
                padding: const EdgeInsets.only(top: 1),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      step,
                      style: AppTypography.outfit(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                        color: isDone
                            ? (isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary)
                            : (isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      descriptions[index],
                      style: AppTypography.inter(
                        color: isDone && isCurrent
                            ? (isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary)
                            : (isDark ? AppColors.darkTextSecondary.withOpacity(0.8) : AppColors.lightTextSecondary.withOpacity(0.8)),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        );
      }),
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
}
