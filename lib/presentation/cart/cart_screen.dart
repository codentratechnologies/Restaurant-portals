import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/colors.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/elastic_button.dart';
import '../../core/widgets/page_transitions.dart';
import '../../state/cart_state.dart';
import '../../state/address_state.dart';
import '../../state/order_state.dart';
import 'select_coupon_screen.dart';
import 'select_payment_method_screen.dart';
import 'select_address_screen.dart';
import '../order/order_detail_screen.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  String _selectedPaymentMethod = 'Google Pay';

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final cartState = Provider.of<CartState>(context);
    final addressState = Provider.of<AddressState>(context);
    final orderState = Provider.of<OrderState>(context);

    final cartItems = cartState.items;
    final deliveryAddress = addressState.selectedAddress;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'My Cart',
          style: AppTypography.outfit(fontWeight: FontWeight.bold),
        ),
        elevation: 0,
      ),
      body: cartItems.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.shopping_bag_outlined,
                    size: 64,
                    color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Your cart is empty',
                    style: AppTypography.outfit(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Add delicious dishes from the home page.',
                    style: AppTypography.inter(
                      fontSize: 14,
                      color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                    ),
                  ),
                ],
              ),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Cart items list
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: cartItems.length,
                    itemBuilder: (context, index) {
                      final item = cartItems[index];
                      return Container(
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
                            // Thumbnail
                            ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Image.network(
                                item.foodItem.imageUrl,
                                width: 70,
                                height: 70,
                                fit: BoxFit.cover,
                              ),
                            ),
                            const SizedBox(width: 12),
                            // Details
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    item.foodItem.name,
                                    style: AppTypography.outfit(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 15,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    item.customizationSummary,
                                    style: AppTypography.inter(
                                      color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                                      fontSize: 12,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    '₹${item.unitPrice.toStringAsFixed(2)}',
                                    style: AppTypography.inter(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 14,
                                      color: AppColors.primary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            // Quantity selector
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                // Remove button
                                IconButton(
                                  icon: const Icon(Icons.delete_outline_rounded, color: AppColors.danger, size: 18),
                                  onPressed: () => cartState.removeFromCart(item.id),
                                  padding: EdgeInsets.zero,
                                  constraints: const BoxConstraints(),
                                ),
                                const SizedBox(height: 8),
                                Container(
                                  decoration: BoxDecoration(
                                    color: isDark ? AppColors.darkBackground : AppColors.lightBackground,
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(
                                      color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                                    ),
                                  ),
                                  child: Row(
                                    children: [
                                      IconButton(
                                        icon: const Icon(Icons.remove, size: 14),
                                        onPressed: () => cartState.updateQuantity(item.id, item.quantity - 1),
                                        constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                                        padding: EdgeInsets.zero,
                                      ),
                                      Text(
                                        '${item.quantity}',
                                        style: AppTypography.inter(fontWeight: FontWeight.bold, fontSize: 13),
                                      ),
                                      IconButton(
                                        icon: const Icon(Icons.add, size: 14),
                                        onPressed: () => cartState.updateQuantity(item.id, item.quantity + 1),
                                        constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                                        padding: EdgeInsets.zero,
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 8),
                  
                  // Address Selector Row
                  GestureDetector(
                    onTap: () {
                      Navigator.push(
                        context,
                        SlidePageRoute(page: const SelectAddressScreen()),
                      );
                    },
                    child: Container(
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
                                  deliveryAddress?.title ?? 'No Delivery Address Set',
                                  style: AppTypography.outfit(fontWeight: FontWeight.bold, fontSize: 14),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  deliveryAddress?.addressLine ?? 'Please tap to select a delivery location.',
                                  style: AppTypography.inter(
                                    fontSize: 12,
                                    color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                          const Icon(Icons.arrow_forward_ios_rounded, size: 16),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Coupon section
                  GestureDetector(
                    onTap: () async {
                      final applied = await Navigator.push<bool>(
                        context,
                        SlidePageRoute(page: const SelectCouponScreen()),
                      );
                      if (applied == true && mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Coupon applied successfully!'),
                            backgroundColor: AppColors.success,
                          ),
                        );
                      }
                    },
                    child: Container(
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
                          const Icon(Icons.local_offer_rounded, color: AppColors.primary, size: 22),
                          const SizedBox(width: 12),
                          Expanded(
                            child: cartState.appliedCoupon != null
                                ? Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Text(
                                            'Coupon Applied: ',
                                            style: AppTypography.inter(fontSize: 13),
                                          ),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                            decoration: BoxDecoration(
                                              color: AppColors.primary.withOpacity(0.15),
                                              borderRadius: BorderRadius.circular(4),
                                            ),
                                            child: Text(
                                              cartState.appliedCoupon!.code,
                                              style: AppTypography.outfit(
                                                color: AppColors.primary,
                                                fontWeight: FontWeight.bold,
                                                fontSize: 12,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        'Discount: -₹${cartState.discount.toStringAsFixed(2)}',
                                        style: AppTypography.inter(
                                          color: AppColors.success,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 12,
                                        ),
                                      )
                                    ],
                                  )
                                : Text(
                                    'Apply Coupon Discount Code',
                                    style: AppTypography.outfit(fontWeight: FontWeight.bold, fontSize: 14),
                                  ),
                          ),
                          if (cartState.appliedCoupon != null)
                            IconButton(
                              icon: const Icon(Icons.cancel_rounded, color: AppColors.danger, size: 20),
                              onPressed: () {
                                cartState.removeCoupon();
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('Coupon removed'),
                                    backgroundColor: AppColors.lightTextSecondary,
                                  ),
                                );
                              },
                              padding: EdgeInsets.zero,
                              constraints: const BoxConstraints(),
                            )
                          else
                            const Icon(Icons.arrow_forward_ios_rounded, size: 16),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Payment method card
                  GestureDetector(
                    onTap: () async {
                      final method = await Navigator.push<String>(
                        context,
                        SlidePageRoute(
                          page: SelectPaymentMethodScreen(initialMethod: _selectedPaymentMethod),
                        ),
                      );
                      if (method != null) {
                        setState(() {
                          _selectedPaymentMethod = method;
                        });
                      }
                    },
                    child: Container(
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
                          const Icon(Icons.payment_rounded, color: AppColors.primary, size: 22),
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
                                  _selectedPaymentMethod,
                                  style: AppTypography.inter(
                                    fontSize: 12,
                                    color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const Icon(Icons.arrow_forward_ios_rounded, size: 16),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Pricing Details
                  Text(
                    'Bill Details',
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
                        _buildPriceRow('Subtotal', cartState.subtotal, isDark),
                        const SizedBox(height: 10),
                        _buildPriceRow('Delivery Fee', cartState.deliveryFee, isDark, isFree: cartState.deliveryFee == 0),
                        const SizedBox(height: 10),
                        _buildPriceRow('GST Tax (8%)', cartState.tax, isDark),
                        if (cartState.appliedCoupon != null) ...[
                          const SizedBox(height: 10),
                          _buildPriceRow('Coupon Discount', -cartState.discount, isDark, isDiscount: true),
                        ],
                        const SizedBox(height: 12),
                        Divider(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
                        const SizedBox(height: 12),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'To Pay',
                              style: AppTypography.outfit(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                            Text(
                              '₹${cartState.total.toStringAsFixed(2)}',
                              style: AppTypography.outfit(
                                fontWeight: FontWeight.bold,
                                fontSize: 18,
                                color: AppColors.primary,
                              ),
                            ),
                          ],
                        )
                      ],
                    ),
                  ),
                  const SizedBox(height: 40),

                  // Checkout CTA Button
                  ElasticButton(
                    onTap: orderState.isLoading
                        ? null
                        : () async {
                            if (deliveryAddress == null) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Please select a delivery address'),
                                  backgroundColor: AppColors.warning,
                                ),
                              );
                              return;
                            }

                            // Place order
                            final order = await orderState.placeOrder(
                              items: cartState.items,
                              address: deliveryAddress,
                              paymentMethod: _selectedPaymentMethod,
                              coupon: cartState.appliedCoupon,
                              subtotal: cartState.subtotal,
                              deliveryFee: cartState.deliveryFee,
                              tax: cartState.tax,
                              discount: cartState.discount,
                              total: cartState.total,
                            );

                            // Clear cart
                            cartState.clearCart();

                            if (mounted) {
                              Navigator.push(
                                context,
                                SlidePageRoute(page: OrderDetailScreen(order: order)),
                              );
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
                        child: orderState.isLoading
                            ? const CircularProgressIndicator(color: Colors.white)
                            : Text(
                                'Place Order • ₹${cartState.total.toStringAsFixed(2)}',
                                style: AppTypography.outfit(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
    );
  }

  Widget _buildPriceRow(String label, double val, bool isDark, {bool isDiscount = false, bool isFree = false}) {
    final textColor = isDiscount
        ? AppColors.success
        : isDark
            ? AppColors.darkTextSecondary
            : AppColors.lightTextSecondary;

    final valueText = isFree
        ? 'FREE'
        : isDiscount
            ? '-₹${(-val).toStringAsFixed(2)}'
            : '₹${val.toStringAsFixed(2)}';

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: AppTypography.inter(
            color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
            fontSize: 13,
          ),
        ),
        Text(
          valueText,
          style: AppTypography.inter(
            color: textColor,
            fontWeight: isDiscount || isFree ? FontWeight.bold : FontWeight.normal,
            fontSize: 13,
          ),
        ),
      ],
    );
  }
}
