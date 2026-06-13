import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/colors.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/custom_text_field.dart';
import '../../core/widgets/elastic_button.dart';
import '../../core/widgets/page_transitions.dart';
import '../../state/auth_state.dart';
import '../../state/address_state.dart';
import '../../state/order_state.dart';
import '../../state/branch_state.dart';
import '../main_navigation.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _fullNameController = TextEditingController();
  final _mobileController = TextEditingController();
  final _usernameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  @override
  void dispose() {
    _fullNameController.dispose();
    _mobileController.dispose();
    _usernameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _handleSignup() async {
    if (_formKey.currentState!.validate()) {
      final authState = Provider.of<AuthState>(context, listen: false);
      final success = await authState.signup(
        fullName: _fullNameController.text.trim(),
        mobileNumber: _mobileController.text.trim(),
        username: _usernameController.text.trim(),
        email: _emailController.text.trim(),
        password: _passwordController.text,
      );

      if (success && mounted) {
        // Refresh address and order state for the signed-up user
        Provider.of<AddressState>(context, listen: false).loadAddresses();
        Provider.of<OrderState>(context, listen: false).loadOrders();
        Provider.of<BranchState>(context, listen: false).autoSelectNearestBranch();

        Navigator.of(context).pushAndRemoveUntil(
          SlidePageRoute(page: const MainNavigation()),
          (route) => false,
        );
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(authState.errorMessage ?? 'Signup failed'),
            backgroundColor: AppColors.danger,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final authState = Provider.of<AuthState>(context);

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 8.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  'Create Account',
                  style: AppTypography.outfit(
                    style: theme.textTheme.headlineLarge,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Join DineOS to order delicious food and track deliveries in real-time.',
                  style: AppTypography.inter(
                    style: theme.textTheme.bodyMedium,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 32),
                
                // Full Name
                CustomTextField(
                  label: 'Full Name',
                  placeholder: 'John Doe',
                  prefixIcon: Icons.person_outline_rounded,
                  controller: _fullNameController,
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Please enter your full name';
                    }
                    if (!RegExp(r'^[a-zA-Z\s]{3,50}$').hasMatch(value.trim())) {
                      return 'Alphabetic characters only, 3-50 chars';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 20),

                // Mobile Number
                CustomTextField(
                  label: 'Mobile Number',
                  placeholder: '9876543210',
                  prefixIcon: Icons.phone_android_outlined,
                  keyboardType: TextInputType.phone,
                  controller: _mobileController,
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Please enter your mobile number';
                    }
                    if (!RegExp(r'^[0-9]{10}$').hasMatch(value.trim())) {
                      return 'Numeric characters only, exactly 10 digits';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 20),

                // Username
                CustomTextField(
                  label: 'Username',
                  placeholder: 'johndoe123',
                  prefixIcon: Icons.alternate_email_rounded,
                  controller: _usernameController,
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Please choose a username';
                    }
                    if (!RegExp(r'^[a-zA-Z0-9]{4,20}$').hasMatch(value.trim())) {
                      return 'Alphanumeric only, 4-20 chars, no spaces';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 20),

                // Email Address
                CustomTextField(
                  label: 'Email Address',
                  placeholder: 'john@example.com',
                  prefixIcon: Icons.email_outlined,
                  keyboardType: TextInputType.emailAddress,
                  controller: _emailController,
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return 'Please enter your email address';
                    }
                    if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value.trim())) {
                      return 'Please enter a valid email address';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 20),

                // Password
                CustomTextField(
                  label: 'Password',
                  placeholder: 'Pass@1234',
                  prefixIcon: Icons.lock_outline_rounded,
                  isPassword: true,
                  controller: _passwordController,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter a password';
                    }
                    // Validate: Min 8 chars, 1 uppercase, 1 lowercase, 1 special char
                    final pattern = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$';
                    if (!RegExp(pattern).hasMatch(value)) {
                      return 'Min 8 chars, 1 uppercase, 1 lowercase, 1 special char';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 20),

                // Confirm Password
                CustomTextField(
                  label: 'Confirm Password',
                  placeholder: 'Re-enter your password',
                  prefixIcon: Icons.lock_clock_outlined,
                  isPassword: true,
                  controller: _confirmPasswordController,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please confirm your password';
                    }
                    if (value != _passwordController.text) {
                      return 'Passwords do not match';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 40),

                // Sign Up CTA
                ElasticButton(
                  onTap: authState.isLoading ? null : _handleSignup,
                  child: Container(
                    height: 56,
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withOpacity(0.25),
                          blurRadius: 16,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: Center(
                      child: authState.isLoading
                          ? const SizedBox(
                              height: 24,
                              width: 24,
                              child: CircularProgressIndicator(
                                color: Colors.white,
                                strokeWidth: 2.5,
                              ),
                            )
                          : Text(
                              'Sign Up',
                              style: AppTypography.outfit(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                    ),
                  ),
                ),
                const SizedBox(height: 32),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      "Already have an account? ",
                      style: AppTypography.inter(
                        style: theme.textTheme.bodyMedium,
                        fontSize: 14,
                      ),
                    ),
                    TextButton(
                      onPressed: () => Navigator.of(context).pop(),
                      style: TextButton.styleFrom(
                        foregroundColor: AppColors.primary,
                        padding: EdgeInsets.zero,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      child: Text(
                        'Sign In',
                        style: AppTypography.outfit(
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
