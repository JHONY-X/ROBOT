import 'package:flutter/material.dart';

/// Exact design tokens extracted from web/src/app/globals.css
class AppColors {
  AppColors._();

  // Primary palette (Forest Green)
  static const Color primary50 = Color(0xFFF1F6F0);
  static const Color primary100 = Color(0xFFE3EEE2);
  static const Color primary200 = Color(0xFFC8DDC8);
  static const Color primary300 = Color(0xFFA4C5A7);
  static const Color primary400 = Color(0xFF79A780);
  static const Color primary500 = Color(0xFF588B65);
  static const Color primary600 = Color(0xFF3E7451);
  static const Color primary700 = Color(0xFF315D43);
  static const Color primary800 = Color(0xFF294B38);
  static const Color primary900 = Color(0xFF203B2E);

  // Accent palette (Rose / Magenta)
  static const Color accent50 = Color(0xFFFFF1F6);
  static const Color accent100 = Color(0xFFFFE3ED);
  static const Color accent200 = Color(0xFFFFC6D9);
  static const Color accent300 = Color(0xFFFF9FBE);
  static const Color accent400 = Color(0xFFF86191);
  static const Color accent500 = Color(0xFFEF3474);
  static const Color accent600 = Color(0xFFE91E63);
  static const Color accent700 = Color(0xFFC71350);
  static const Color accent800 = Color(0xFFA51449);
  static const Color accent900 = Color(0xFF8B1742);

  // Background & Surfaces
  static const Color background = Color(0xFFF7F8F4);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color darkBackground = Color(0xFF0B1220);
  static const Color darkSurface = Color(0xFF111827);

  // Text colors
  static const Color textMain = Color(0xFF24352B);
  static const Color textMuted = Color(0xFF69766C);
  static const Color slate950 = Color(0xFF020617);
  static const Color slate900 = Color(0xFF0F172A);
  static const Color slate700 = Color(0xFF334155);
  static const Color slate600 = Color(0xFF475569);
  static const Color slate500 = Color(0xFF64748B);
  static const Color slate400 = Color(0xFF94A3B8);
  static const Color slate300 = Color(0xFFCBD5E1);
  static const Color slate200 = Color(0xFFE2E8F0);
  static const Color slate100 = Color(0xFFF1F5F9);
  static const Color slate50 = Color(0xFFF8FAFC);
  static const Color slate800 = Color(0xFF1E293B);

  // Status & Feedback
  static const Color success = Color(0xFF10B981);
  static const Color successLight = Color(0xFFECFDF5);
  static const Color warning = Color(0xFFF59E0B);
  static const Color warningLight = Color(0xFFFFFBEB);
  static const Color error = Color(0xFFEF4444);
  static const Color errorLight = Color(0xFFFEF2F2);

  // Brand Ribbon Gradient
  static const LinearGradient brandRibbon = LinearGradient(
    colors: [
      Color(0xFF203B2E),
      Color(0xFF315D43),
      Color(0xFF3E7451),
      Color(0xFFE91E63),
    ],
    stops: [0.0, 0.35, 0.70, 1.0],
  );
}
