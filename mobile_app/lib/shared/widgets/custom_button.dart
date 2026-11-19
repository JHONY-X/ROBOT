import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';

enum ButtonVariant { primary, secondary, outline, ghost, danger }
enum ButtonSize { sm, md, lg }

class CustomButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final ButtonVariant variant;
  final ButtonSize size;
  final Widget? icon;
  final bool isLoading;
  final double? width;

  const CustomButton({
    super.key,
    required this.label,
    this.onPressed,
    this.variant = ButtonVariant.primary,
    this.size = ButtonSize.md,
    this.icon,
    this.isLoading = false,
    this.width,
  });

  @override
  Widget build(BuildContext context) {
    Color bgColor;
    Color textColor;
    BorderSide borderSide = BorderSide.none;

    switch (variant) {
      case ButtonVariant.primary:
        bgColor = AppColors.accent600;
        textColor = Colors.white;
        break;
      case ButtonVariant.secondary:
        bgColor = AppColors.primary50;
        textColor = AppColors.primary700;
        break;
      case ButtonVariant.outline:
        bgColor = Colors.white;
        textColor = AppColors.slate700;
        borderSide = const BorderSide(color: AppColors.slate200);
        break;
      case ButtonVariant.ghost:
        bgColor = Colors.transparent;
        textColor = AppColors.slate600;
        break;
      case ButtonVariant.danger:
        bgColor = AppColors.error;
        textColor = Colors.white;
        break;
    }

    double height;
    EdgeInsets padding;
    TextStyle textStyle;

    switch (size) {
      case ButtonSize.sm:
        height = 36;
        padding = const EdgeInsets.symmetric(horizontal: 12);
        textStyle = AppTypography.buttonLabel.copyWith(fontSize: 12, color: textColor);
        break;
      case ButtonSize.md:
        height = 42;
        padding = const EdgeInsets.symmetric(horizontal: 16);
        textStyle = AppTypography.buttonLabel.copyWith(fontSize: 14, color: textColor);
        break;
      case ButtonSize.lg:
        height = 48;
        padding = const EdgeInsets.symmetric(horizontal: 24);
        textStyle = AppTypography.buttonLabel.copyWith(fontSize: 15, color: textColor);
        break;
    }

    return SizedBox(
      width: width,
      height: height,
      child: Material(
        color: bgColor,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: borderSide,
        ),
        elevation: (variant == ButtonVariant.primary && onPressed != null) ? 1 : 0,
        child: InkWell(
          onTap: isLoading ? null : onPressed,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: padding,
            child: Row(
              mainAxisSize: width == null ? MainAxisSize.min : MainAxisSize.max,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (isLoading) ...[
                  SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: textColor,
                    ),
                  ),
                  const SizedBox(width: 8),
                ] else if (icon != null) ...[
                  icon!,
                  const SizedBox(width: 8),
                ],
                Text(label, style: textStyle),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
