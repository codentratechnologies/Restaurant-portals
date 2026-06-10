import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';
import '../../core/state.dart';

class CollectPaymentScreen extends StatefulWidget {
  const CollectPaymentScreen({super.key});

  @override
  State<CollectPaymentScreen> createState() => _CollectPaymentScreenState();
}

class _CollectPaymentScreenState extends State<CollectPaymentScreen> {
  String _paymentMethod = 'Cash'; // Cash or UPI
  bool _isProcessing = false;

  void _handlePaymentConfirmation() {
    setState(() {
      _isProcessing = true;
    });

    // Simulate network confirmation (1.2 seconds delay)
    Future.delayed(const Duration(milliseconds: 1200), () {
      if (!mounted) return;
      final state = AppState();
      state.confirmPayment();

      setState(() {
        _isProcessing = false;
      });

      // Show success dialog
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) {
          final isDark = Theme.of(context).brightness == Brightness.dark;
          return AlertDialog(
            backgroundColor: isDark ? AppColors.darkSurface : AppColors.lightSurface,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            title: Row(
              children: [
                const Icon(Icons.check_circle, color: AppColors.success, size: 28),
                const SizedBox(width: 8),
                Text(
                  'Payment Verified',
                  style: GoogleFonts.outfit(fontWeight: FontWeight.bold),
                ),
              ],
            ),
            content: Text(
              _paymentMethod == 'UPI'
                  ? 'UPI transfer verified. Transaction Ref: TXN-892102.'
                  : 'Cash collection confirmed and logged successfully.',
              style: GoogleFonts.inter(),
            ),
            actions: [
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(context); // Close dialog
                  Navigator.pop(context); // Go back to active order screen
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.success,
                  foregroundColor: Colors.white,
                ),
                child: const Text('PROCEED'),
              ),
            ],
          );
        },
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = AppState();
    final order = state.activeOrder;

    if (order == null) {
      return const Scaffold(
        body: Center(child: Text('No active order')),
      );
    }

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardBg = isDark ? AppColors.darkSurface : AppColors.lightSurface;
    final textPrimary = isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary;
    final textSecondary = isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary;

    return Scaffold(
      appBar: AppBar(
        title: Text('Payment: ${order.orderId}'),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Amount Due Box
              Container(
                padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 20),
                decoration: BoxDecoration(
                  color: AppColors.warning.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.warning.withOpacity(0.25), width: 1.5),
                ),
                child: Column(
                  children: [
                    Text(
                      'TOTAL CASH TO COLLECT',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: AppColors.warning,
                        letterSpacing: 1.0,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '₹${order.collectAmount.toStringAsFixed(2)}',
                      style: GoogleFonts.outfit(
                        fontSize: 36,
                        fontWeight: FontWeight.w900,
                        color: AppColors.warning,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 28),

              // Payment Method Selectors
              Text(
                'Select Collection Mode:',
                style: GoogleFonts.outfit(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: textPrimary,
                ),
              ),
              const SizedBox(height: 12),

              Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          _paymentMethod = 'Cash';
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        decoration: BoxDecoration(
                          color: _paymentMethod == 'Cash'
                              ? AppColors.primary.withOpacity(0.1)
                              : cardBg,
                          border: Border.all(
                            color: _paymentMethod == 'Cash'
                                ? AppColors.primary
                                : (isDark ? Colors.white10 : Colors.black.withOpacity(0.05)),
                            width: 1.5,
                          ),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          children: [
                            Icon(
                              Icons.payments_outlined,
                              color: _paymentMethod == 'Cash' ? AppColors.primary : textSecondary,
                              size: 28,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Cash',
                              style: GoogleFonts.outfit(
                                fontWeight: FontWeight.bold,
                                color: _paymentMethod == 'Cash' ? AppColors.primary : textPrimary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          _paymentMethod = 'UPI';
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        decoration: BoxDecoration(
                          color: _paymentMethod == 'UPI'
                              ? AppColors.primary.withOpacity(0.1)
                              : cardBg,
                          border: Border.all(
                            color: _paymentMethod == 'UPI'
                                ? AppColors.primary
                                : (isDark ? Colors.white10 : Colors.black.withOpacity(0.05)),
                            width: 1.5,
                          ),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          children: [
                            Icon(
                              Icons.qr_code_2_rounded,
                              color: _paymentMethod == 'UPI' ? AppColors.primary : textSecondary,
                              size: 28,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'UPI / QR Code',
                              style: GoogleFonts.outfit(
                                fontWeight: FontWeight.bold,
                                color: _paymentMethod == 'UPI' ? AppColors.primary : textPrimary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 28),

              // UPI Section QR view
              Expanded(
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 250),
                  child: _paymentMethod == 'UPI'
                      ? Container(
                          key: const ValueKey('UPI_PANEL'),
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: cardBg,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isDark ? Colors.white10 : Colors.black.withOpacity(0.05),
                            ),
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                'Scan QR with Customer Phone',
                                style: GoogleFonts.outfit(
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold,
                                  color: textPrimary,
                                ),
                              ),
                              const SizedBox(height: 16),
                              // Mock QR Image Box
                              Container(
                                width: 160,
                                height: 160,
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: Colors.grey.shade300, width: 2),
                                ),
                                child: Image.network(
                                  'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=dineos@icici%26pn=DineOs%26am=${order.collectAmount}%26cu=INR',
                                  loadingBuilder: (context, child, loadingProgress) {
                                    if (loadingProgress == null) return child;
                                    return const Center(child: CircularProgressIndicator());
                                  },
                                  errorBuilder: (context, error, stackTrace) {
                                    return const Center(
                                      child: Icon(Icons.qr_code, size: 80, color: Colors.black54),
                                    );
                                  },
                                ),
                              ),
                              const SizedBox(height: 16),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const SizedBox(
                                    width: 14,
                                    height: 14,
                                    child: CircularProgressIndicator(strokeWidth: 2),
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Status: Waiting for Payment...',
                                    style: GoogleFonts.inter(
                                      fontSize: 12,
                                      color: textSecondary,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        )
                      : Container(
                          key: const ValueKey('CASH_PANEL'),
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: cardBg,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: isDark ? Colors.white10 : Colors.black.withOpacity(0.05),
                            ),
                          ),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(
                                Icons.payments,
                                size: 54,
                                color: AppColors.success,
                              ),
                              const SizedBox(height: 12),
                              Text(
                                'Physical Cash Collection',
                                style: GoogleFonts.outfit(
                                  fontSize: 15,
                                  fontWeight: FontWeight.bold,
                                  color: textPrimary,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Collect cash from the customer first, count the billing amount, and verify before logging the completion details.',
                                textAlign: TextAlign.center,
                                style: GoogleFonts.inter(
                                  fontSize: 12,
                                  color: textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 20),

              // Confirm Button
              SizedBox(
                height: 52,
                child: ElevatedButton(
                  onPressed: _isProcessing ? null : _handlePaymentConfirmation,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.success,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: _isProcessing
                      ? const CircularProgressIndicator(color: Colors.white)
                      : Text(
                          _paymentMethod == 'UPI'
                              ? 'SIMULATE UPI PAYMENT RECEIVED'
                              : 'CONFIRM CASH RECEIVED',
                          style: GoogleFonts.outfit(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
