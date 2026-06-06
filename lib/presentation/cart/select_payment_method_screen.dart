import 'package:flutter/material.dart';
import '../../core/theme/colors.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/elastic_button.dart';

class SelectPaymentMethodScreen extends StatefulWidget {
  final String initialMethod;

  const SelectPaymentMethodScreen({super.key, required this.initialMethod});

  @override
  State<SelectPaymentMethodScreen> createState() => _SelectPaymentMethodScreenState();
}

class _SelectPaymentMethodScreenState extends State<SelectPaymentMethodScreen> {
  late String _selectedMethod;

  final List<Map<String, dynamic>> _methods = [
    {
      'name': 'Google Pay',
      'icon': Icons.g_mobiledata_rounded,
      'description': 'Pay instantly using Google Pay UPI link.',
    },
    {
      'name': 'Credit / Debit Card',
      'icon': Icons.credit_card_rounded,
      'description': 'Pay securely with Visa, Mastercard or RuPay.',
    },
    {
      'name': 'UPI Apps (PhonePe/Paytm)',
      'icon': Icons.account_balance_wallet_rounded,
      'description': 'Pay using installed UPI mobile apps.',
    },
    {
      'name': 'Cash On Delivery',
      'icon': Icons.payments_rounded,
      'description': 'Pay with cash upon delivery of food.',
    },
  ];

  @override
  void initState() {
    super.initState();
    _selectedMethod = widget.initialMethod;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Payment Methods',
          style: AppTypography.outfit(fontWeight: FontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(20.0),
              itemCount: _methods.length,
              itemBuilder: (context, index) {
                final method = _methods[index];
                final isSelected = method['name'] == _selectedMethod;

                return GestureDetector(
                  onTap: () {
                    setState(() {
                      _selectedMethod = method['name'];
                    });
                  },
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isSelected
                            ? AppColors.primary
                            : isDark
                                ? AppColors.darkBorder
                                : AppColors.lightBorder,
                        width: isSelected ? 1.5 : 1.0,
                      ),
                    ),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withOpacity(0.1),
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            method['icon'] as IconData,
                            color: AppColors.primary,
                            size: 24,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                method['name'] as String,
                                style: AppTypography.outfit(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 15,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                method['description'] as String,
                                style: AppTypography.inter(
                                  color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Radio<String>(
                          value: method['name'] as String,
                          groupValue: _selectedMethod,
                          activeColor: AppColors.primary,
                          onChanged: (val) {
                            if (val != null) {
                              setState(() {
                                _selectedMethod = val;
                              });
                            }
                          },
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          // Confirmation Button at bottom
          Padding(
            padding: const EdgeInsets.all(20.0),
            child: ElasticButton(
              onTap: () => Navigator.of(context).pop(_selectedMethod),
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
                    'Confirm Method',
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
    );
  }
}
