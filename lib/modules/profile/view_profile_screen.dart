import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme.dart';
import '../../core/state.dart';

class ViewProfileScreen extends StatelessWidget {
  const ViewProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = AppState();
    final driver = state.driver;

    if (driver == null) {
      return const Scaffold(
        body: Center(child: Text('Error loading profile')),
      );
    }

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textPrimary = isDark ? AppColors.darkTextPrimary : AppColors.lightTextPrimary;
    final textSecondary = isDark ? AppColors.darkTextSecondary : AppColors.lightTextSecondary;
    final cardBg = isDark ? AppColors.darkSurface : AppColors.lightSurface;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Contractual Profile'),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Center Profile Large Preview
            Center(
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 50,
                    backgroundImage: NetworkImage(driver.profilePhotoUrl),
                    backgroundColor: AppColors.primary.withOpacity(0.1),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    driver.name,
                    style: GoogleFonts.outfit(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: textPrimary,
                    ),
                  ),
                  Text(
                    'Driver Ref Code: ${driver.id}',
                    style: GoogleFonts.inter(
                      fontSize: 12,
                      color: textSecondary,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // Driver detail properties card
            Text(
              'Driver Personal Details',
              style: GoogleFonts.outfit(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: textPrimary,
              ),
            ),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: cardBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isDark ? Colors.white10 : Colors.black.withOpacity(0.04),
                ),
              ),
              child: Column(
                children: [
                  _buildDetailItem('Username', driver.username, textPrimary, textSecondary),
                  const Divider(height: 24),
                  _buildDetailItem('Email Address', driver.email, textPrimary, textSecondary),
                  const Divider(height: 24),
                  _buildDetailItem('Mobile Number', driver.mobile, textPrimary, textSecondary),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Operational Assignment Card
            Text(
              'Operational Assignments',
              style: GoogleFonts.outfit(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: textPrimary,
              ),
            ),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: cardBg,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isDark ? Colors.white10 : Colors.black.withOpacity(0.04),
                ),
              ),
              child: Column(
                children: [
                  _buildDetailItem('Assigned Branch', driver.branchName, textPrimary, textSecondary),
                  const Divider(height: 24),
                  _buildDetailItem('Daily Shift Time', driver.shiftTime, textPrimary, textSecondary),
                  const Divider(height: 24),
                  _buildDetailItem(
                    'Monthly Basic Contract Salary',
                    '₹${driver.monthlySalary.toStringAsFixed(2)}',
                    AppColors.success,
                    textSecondary,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailItem(String label, String value, Color valueColor, Color labelColor) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Text(
            label,
            style: GoogleFonts.inter(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: labelColor,
            ),
          ),
        ),
        const SizedBox(width: 12),
        Text(
          value,
          textAlign: Alignment.bottomRight.x > 0 ? TextAlign.right : TextAlign.left,
          style: GoogleFonts.outfit(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: valueColor,
          ),
        ),
      ],
    );
  }
}
