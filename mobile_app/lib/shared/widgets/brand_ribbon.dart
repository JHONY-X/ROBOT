import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class BrandRibbon extends StatelessWidget {
  final double height;
  const BrandRibbon({super.key, this.height = 4.0});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: AppColors.brandRibbon,
      ),
    );
  }
}
