import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'colors.dart';

class AppTypography {
  // Primary font family: Outfit
  static TextStyle outfit({
    TextStyle? style,
    Color? color,
    double? fontSize,
    FontWeight? fontWeight,
    double? height,
  }) {
    return GoogleFonts.outfit(
      textStyle: style,
      color: color,
      fontSize: fontSize,
      fontWeight: fontWeight,
      height: height,
    );
  }

  // Secondary font family: Inter (UI elements, tabular lists)
  static TextStyle inter({
    TextStyle? style,
    Color? color,
    double? fontSize,
    FontWeight? fontWeight,
    double? height,
  }) {
    return GoogleFonts.inter(
      textStyle: style,
      color: color,
      fontSize: fontSize,
      fontWeight: fontWeight,
      height: height,
    );
  }
}

class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: AppColors.primary,
      scaffoldBackgroundColor: AppColors.lightBackground,
      colorScheme: const ColorScheme.light(
        primary: AppColors.primary,
        secondary: AppColors.primary,
        surface: AppColors.lightSurface,
        background: AppColors.lightBackground,
        error: AppColors.danger,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.lightBackground,
        foregroundColor: AppColors.lightTextPrimary,
        elevation: 0,
        centerTitle: true,
        iconTheme: IconThemeData(color: AppColors.lightTextPrimary),
      ),
      textTheme: TextTheme(
        displayLarge: GoogleFonts.outfit(color: AppColors.lightTextPrimary, fontWeight: FontWeight.bold),
        displayMedium: GoogleFonts.outfit(color: AppColors.lightTextPrimary, fontWeight: FontWeight.bold),
        displaySmall: GoogleFonts.outfit(color: AppColors.lightTextPrimary, fontWeight: FontWeight.bold),
        headlineLarge: GoogleFonts.outfit(color: AppColors.lightTextPrimary, fontWeight: FontWeight.w600),
        headlineMedium: GoogleFonts.outfit(color: AppColors.lightTextPrimary, fontWeight: FontWeight.w600),
        headlineSmall: GoogleFonts.outfit(color: AppColors.lightTextPrimary, fontWeight: FontWeight.w600),
        titleLarge: GoogleFonts.outfit(color: AppColors.lightTextPrimary, fontWeight: FontWeight.w500),
        titleMedium: GoogleFonts.outfit(color: AppColors.lightTextPrimary, fontWeight: FontWeight.w500),
        titleSmall: GoogleFonts.outfit(color: AppColors.lightTextPrimary, fontWeight: FontWeight.w500),
        bodyLarge: GoogleFonts.inter(color: AppColors.lightTextPrimary),
        bodyMedium: GoogleFonts.inter(color: AppColors.lightTextSecondary),
        bodySmall: GoogleFonts.inter(color: AppColors.lightTextSecondary),
        labelLarge: GoogleFonts.inter(color: AppColors.lightTextPrimary, fontWeight: FontWeight.w500),
        labelMedium: GoogleFonts.inter(color: AppColors.lightTextSecondary),
        labelSmall: GoogleFonts.inter(color: AppColors.lightTextSecondary),
      ),
      cardTheme: CardThemeData(
        color: AppColors.lightSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          side: const BorderSide(color: AppColors.lightBorder),
          borderRadius: BorderRadius.circular(16),
        ),
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      primaryColor: AppColors.primary,
      scaffoldBackgroundColor: AppColors.darkBackground,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.primary,
        secondary: AppColors.primary,
        surface: AppColors.darkSurface,
        background: AppColors.darkBackground,
        error: AppColors.danger,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.darkBackground,
        foregroundColor: AppColors.darkTextPrimary,
        elevation: 0,
        centerTitle: true,
        iconTheme: IconThemeData(color: AppColors.darkTextPrimary),
      ),
      textTheme: TextTheme(
        displayLarge: GoogleFonts.outfit(color: AppColors.darkTextPrimary, fontWeight: FontWeight.bold),
        displayMedium: GoogleFonts.outfit(color: AppColors.darkTextPrimary, fontWeight: FontWeight.bold),
        displaySmall: GoogleFonts.outfit(color: AppColors.darkTextPrimary, fontWeight: FontWeight.bold),
        headlineLarge: GoogleFonts.outfit(color: AppColors.darkTextPrimary, fontWeight: FontWeight.w600),
        headlineMedium: GoogleFonts.outfit(color: AppColors.darkTextPrimary, fontWeight: FontWeight.w600),
        headlineSmall: GoogleFonts.outfit(color: AppColors.darkTextPrimary, fontWeight: FontWeight.w600),
        titleLarge: GoogleFonts.outfit(color: AppColors.darkTextPrimary, fontWeight: FontWeight.w500),
        titleMedium: GoogleFonts.outfit(color: AppColors.darkTextPrimary, fontWeight: FontWeight.w500),
        titleSmall: GoogleFonts.outfit(color: AppColors.darkTextPrimary, fontWeight: FontWeight.w500),
        bodyLarge: GoogleFonts.inter(color: AppColors.darkTextPrimary),
        bodyMedium: GoogleFonts.inter(color: AppColors.darkTextSecondary),
        bodySmall: GoogleFonts.inter(color: AppColors.darkTextSecondary),
        labelLarge: GoogleFonts.inter(color: AppColors.darkTextPrimary, fontWeight: FontWeight.w500),
        labelMedium: GoogleFonts.inter(color: AppColors.darkTextSecondary),
        labelSmall: GoogleFonts.inter(color: AppColors.darkTextSecondary),
      ),
      cardTheme: CardThemeData(
        color: AppColors.darkSurface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          side: const BorderSide(color: AppColors.darkBorder),
          borderRadius: BorderRadius.circular(16),
        ),
      ),
    );
  }
}
