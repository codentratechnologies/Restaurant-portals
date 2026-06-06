import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/colors.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/elastic_button.dart';
import '../../core/widgets/page_transitions.dart';
import '../../state/address_state.dart';
import 'add_address_screen.dart';

class SelectAddressScreen extends StatelessWidget {
  const SelectAddressScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final addressState = Provider.of<AddressState>(context);
    final addresses = addressState.addresses;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Select Address',
          style: AppTypography.outfit(fontWeight: FontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_location_alt_outlined, color: AppColors.primary),
            onPressed: () {
              Navigator.push(
                context,
                SlidePageRoute(page: const AddAddressScreen()),
              );
            },
          )
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: addressState.isLoading
                ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                : addresses.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.location_off_outlined, size: 64, color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary),
                            const SizedBox(height: 16),
                            Text(
                              'No addresses saved yet',
                              style: AppTypography.outfit(fontSize: 16, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 12),
                            ElasticButton(
                              onTap: () {
                                Navigator.push(
                                  context,
                                  SlidePageRoute(page: const AddAddressScreen()),
                                );
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                                decoration: BoxDecoration(
                                  color: AppColors.primary,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  'Add Address',
                                  style: AppTypography.outfit(color: Colors.white, fontWeight: FontWeight.bold),
                                ),
                              ),
                            )
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(20.0),
                        itemCount: addresses.length,
                        itemBuilder: (context, index) {
                          final address = addresses[index];
                          final isSelected = address.id == addressState.selectedAddress?.id;

                          return GestureDetector(
                            onTap: () {
                              addressState.selectAddress(address);
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
                                  Icon(
                                    address.type == 'Home'
                                        ? Icons.home_rounded
                                        : address.type == 'Work'
                                            ? Icons.work_rounded
                                            : Icons.location_on_rounded,
                                    color: AppColors.primary,
                                    size: 24,
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          address.title,
                                          style: AppTypography.outfit(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 14,
                                          ),
                                        ),
                                        const SizedBox(height: 2),
                                        Text(
                                          address.addressLine,
                                          style: AppTypography.inter(
                                            color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                                            fontSize: 12,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Radio<String>(
                                    value: address.id,
                                    groupValue: addressState.selectedAddress?.id,
                                    activeColor: AppColors.primary,
                                    onChanged: (val) {
                                      addressState.selectAddress(address);
                                    },
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
          ),
          if (addresses.isNotEmpty)
            Padding(
              padding: const EdgeInsets.all(20.0),
              child: ElasticButton(
                onTap: () => Navigator.of(context).pop(),
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
                      'Confirm Address',
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
