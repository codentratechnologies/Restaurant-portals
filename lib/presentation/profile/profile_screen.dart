import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/colors.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/page_transitions.dart';
import '../../state/auth_state.dart';
import '../../state/theme_state.dart';
import '../../state/address_state.dart';
import '../../state/order_state.dart';
import '../../state/support_state.dart';
import '../auth/login_screen.dart';
import 'edit_profile_screen.dart';
import 'food_collection_screen.dart';
import 'recent_orders_screen.dart';
import 'address_book_screen.dart';
import 'support_screen.dart';


class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Future<void> _onRefresh() async {
    if (!mounted) return;
    final orderState = Provider.of<OrderState>(context, listen: false);
    final addressState = Provider.of<AddressState>(context, listen: false);
    final supportState = Provider.of<SupportState>(context, listen: false);
    await orderState.loadOrders();
    await addressState.loadAddresses();
    await supportState.loadTickets();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final authState = Provider.of<AuthState>(context);
    final themeState = Provider.of<ThemeState>(context);
    final user = authState.currentUser;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'My Profile',
          style: AppTypography.outfit(fontWeight: FontWeight.bold),
        ),
        elevation: 0,
      ),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: _onRefresh,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(vertical: 24),
          child: Column(
            children: [
            // User Avatar Card
            Center(
              child: Column(
                children: [
                  Container(
                    width: 90,
                    height: 90,
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.1),
                      shape: BoxShape.circle,
                      border: Border.all(color: AppColors.primary, width: 2),
                    ),
                    child: Center(
                      child: Text(
                        user != null && user.fullName.isNotEmpty ? user.fullName[0].toUpperCase() : 'G',
                        style: AppTypography.outfit(
                          color: AppColors.primary,
                          fontWeight: FontWeight.bold,
                          fontSize: 36,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    user?.fullName ?? 'Guest User',
                    style: AppTypography.outfit(
                      fontWeight: FontWeight.bold,
                      fontSize: 20,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    user?.email ?? '',
                    style: AppTypography.inter(
                      color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // Profile Menu List
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20.0),
              child: Column(
                children: [
                  // Dark Mode Switcher Row
                  _buildMenuRow(
                    icon: themeState.isDarkMode ? Icons.light_mode_rounded : Icons.dark_mode_rounded,
                    title: 'Dark Theme Mode',
                    isDark: isDark,
                    trailing: Switch(
                      value: themeState.isDarkMode,
                      activeColor: AppColors.primary,
                      onChanged: (val) => themeState.toggleTheme(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  _buildMenuRow(
                    icon: Icons.person_outline_rounded,
                    title: 'Edit Profile Details',
                    isDark: isDark,
                    onTap: () {
                      Navigator.push(
                        context,
                        SlidePageRoute(page: const EditProfileScreen()),
                      );
                    },
                  ),
                  const SizedBox(height: 12),
                  _buildMenuRow(
                    icon: Icons.favorite_border_rounded,
                    title: 'My Food Collections',
                    isDark: isDark,
                    onTap: () {
                      Navigator.push(
                        context,
                        SlidePageRoute(page: const FoodCollectionScreen()),
                      );
                    },
                  ),
                  const SizedBox(height: 12),
                  _buildMenuRow(
                    icon: Icons.history_rounded,
                    title: 'Recent Order History',
                    isDark: isDark,
                    onTap: () {
                      Navigator.push(
                        context,
                        SlidePageRoute(page: const RecentOrdersScreen(showBackButton: true)),
                      );
                    },
                  ),
                  const SizedBox(height: 12),
                  _buildMenuRow(
                    icon: Icons.location_on_outlined,
                    title: 'Delivery Address Book',
                    isDark: isDark,
                    onTap: () {
                       Navigator.push(
                         context,
                         SlidePageRoute(page: const AddressBookScreen()),
                       );
                    },
                  ),
                  const SizedBox(height: 12),
                  _buildMenuRow(
                    icon: Icons.support_agent_rounded,
                    title: 'Customer Help & Support',
                    isDark: isDark,
                    onTap: () {
                      Navigator.push(
                        context,
                        SlidePageRoute(page: const SupportScreen()),
                      );
                    },
                  ),
                  const SizedBox(height: 24),
                  Divider(color: isDark ? AppColors.darkBorder : AppColors.lightBorder),
                  const SizedBox(height: 16),
                  // Log Out Row
                  _buildMenuRow(
                    icon: Icons.logout_rounded,
                    title: 'Log Out Account',
                    isDark: isDark,
                    color: AppColors.danger,
                    onTap: () {
                      authState.logout();
                      Provider.of<AddressState>(context, listen: false).loadAddresses();
                      Provider.of<OrderState>(context, listen: false).loadOrders();
                      Provider.of<SupportState>(context, listen: false).loadTickets();
                      Navigator.of(context).pushAndRemoveUntil(
                        SlidePageRoute(page: const LoginScreen()),
                        (route) => false,
                      );
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    ),
    );
  }

  Widget _buildMenuRow({
    required IconData icon,
    required String title,
    required bool isDark,
    Color? color,
    Widget? trailing,
    VoidCallback? onTap,
  }) {
    final textColor = color ?? (isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary);
    final iconColor = color ?? AppColors.primary;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
          ),
        ),
        child: Row(
          children: [
            Icon(icon, color: iconColor, size: 22),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                title,
                style: AppTypography.outfit(
                  color: textColor,
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
            ),
            trailing ?? Icon(Icons.arrow_forward_ios_rounded, size: 14, color: isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary),
          ],
        ),
      ),
    );
  }
}
