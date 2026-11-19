import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';

enum StatusType { success, warning, error, info, neutral }

class StatusChip extends StatelessWidget {
  final String label;
  final StatusType type;

  const StatusChip({
    super.key,
    required this.label,
    this.type = StatusType.neutral,
  });

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color text;
    Color border;

    switch (type) {
      case StatusType.success:
        bg = AppColors.successLight;
        text = const Color(0xFF065F46);
        border = const Color(0xFFA7F3D0);
        break;
      case StatusType.warning:
        bg = AppColors.warningLight;
        text = const Color(0xFF92400E);
        border = const Color(0xFFFDE68A);
        break;
      case StatusType.error:
        bg = AppColors.errorLight;
        text = const Color(0xFF991B1B);
        border = const Color(0xFFFECACA);
        break;
      case StatusType.info:
        bg = AppColors.primary50;
        text = AppColors.primary700;
        border = AppColors.primary200;
        break;
      case StatusType.neutral:
        bg = AppColors.slate100;
        text = AppColors.slate700;
        border = AppColors.slate200;
        break;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(9999),
        border: Border.all(color: border),
      ),
      child: Text(
        label,
        style: AppTypography.bodySmall.copyWith(
          color: text,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
