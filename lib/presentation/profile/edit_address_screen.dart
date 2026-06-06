import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/colors.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/custom_text_field.dart';
import '../../core/widgets/elastic_button.dart';
import '../../data/models/address.dart';
import '../../state/address_state.dart';

class EditAddressScreen extends StatefulWidget {
  final Address address;

  const EditAddressScreen({super.key, required this.address});

  @override
  State<EditAddressScreen> createState() => _EditAddressScreenState();
}

class _EditAddressScreenState extends State<EditAddressScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _titleController;
  late TextEditingController _addressController;
  late TextEditingController _landmarkController;
  late TextEditingController _pinController;
  late String _selectedType;

  @override
  void initState() {
    super.initState();
    _titleController = TextEditingController(text: widget.address.title);
    _addressController = TextEditingController(text: widget.address.addressLine);
    _landmarkController = TextEditingController(text: widget.address.landmark);
    _pinController = TextEditingController(text: widget.address.pinCode);
    _selectedType = widget.address.type;
  }

  @override
  void dispose() {
    _titleController.dispose();
    _addressController.dispose();
    _landmarkController.dispose();
    _pinController.dispose();
    super.dispose();
  }

  void _updateAddress() async {
    if (_formKey.currentState!.validate()) {
      final addressState = Provider.of<AddressState>(context, listen: false);
      await addressState.updateAddress(
        widget.address.id,
        _titleController.text.trim(),
        _addressController.text.trim(),
        _landmarkController.text.trim(),
        _pinController.text.trim(),
        _selectedType,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Address updated successfully!'),
            backgroundColor: AppColors.success,
          ),
        );
        Navigator.of(context).pop();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Edit Address',
          style: AppTypography.outfit(fontWeight: FontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                CustomTextField(
                  label: 'Address Title',
                  placeholder: 'e.g. Home, Office, Parents House',
                  prefixIcon: Icons.bookmark_outline_rounded,
                  controller: _titleController,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter a title for this address';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 20),
                CustomTextField(
                  label: 'Complete Address Line',
                  placeholder: 'Flat/House No., Building Name, Street',
                  prefixIcon: Icons.home_outlined,
                  controller: _addressController,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter the complete address';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 20),
                CustomTextField(
                  label: 'Landmark (Optional)',
                  placeholder: 'e.g. Near City Hospital',
                  prefixIcon: Icons.map_outlined,
                  controller: _landmarkController,
                ),
                const SizedBox(height: 20),
                CustomTextField(
                  label: 'Pincode',
                  placeholder: '10001',
                  prefixIcon: Icons.pin_drop_outlined,
                  keyboardType: TextInputType.number,
                  controller: _pinController,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter the pin code';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 24),
                // Address Type Chips
                Text(
                  'Address Type',
                  style: AppTypography.outfit(
                    style: theme.textTheme.labelLarge,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: ['Home', 'Work', 'Other'].map((type) {
                    final isSelected = _selectedType == type;
                    return Padding(
                      padding: const EdgeInsets.only(right: 12.0),
                      child: ChoiceChip(
                        label: Text(type),
                        selected: isSelected,
                        selectedColor: AppColors.primary,
                        checkmarkColor: Colors.white,
                        labelStyle: AppTypography.outfit(
                          color: isSelected ? Colors.white : (isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary),
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                          fontSize: 13,
                        ),
                        onSelected: (selected) {
                          if (selected) {
                            setState(() {
                              _selectedType = type;
                            });
                          }
                        },
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                          side: BorderSide(
                            color: isSelected ? AppColors.primary : (isDark ? AppColors.darkBorder : AppColors.lightBorder),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 48),
                // Save Button
                ElasticButton(
                  onTap: _updateAddress,
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
                        'Update Address',
                        style: AppTypography.outfit(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
