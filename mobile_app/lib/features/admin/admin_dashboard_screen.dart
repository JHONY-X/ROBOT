import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../shared/widgets/custom_button.dart';
import '../../shared/widgets/custom_card.dart';

class AdminDashboardScreen extends StatelessWidget {
  final VoidCallback onOpenVerifications;

  const AdminDashboardScreen({
    super.key,
    required this.onOpenVerifications,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Executive Dashboard', style: AppTypography.h1),
                  SizedBox(height: 2),
                  Text('Cross-platform recruitment KPIs & operations.', style: AppTypography.bodySmall),
                ],
              ),
              CustomButton(
                label: 'Export CSV',
                size: ButtonSize.sm,
                variant: ButtonVariant.outline,
                icon: const Icon(Icons.download_rounded, size: 14),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Exporting KPI report to CSV...')),
                  );
                },
              ),
            ],
          ),
          const SizedBox(height: 16),

          // KPI Cards Grid (4 cards)
          Row(
            children: [
              Expanded(
                child: _buildMetricCard(
                  title: 'Candidates',
                  value: '148',
                  change: '112 Verified',
                  icon: Icons.people_outline_rounded,
                  color: AppColors.primary600,
                  bgColor: AppColors.primary50,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildMetricCard(
                  title: 'Employers',
                  value: '36',
                  change: '29 Active Plans',
                  icon: Icons.domain_outlined,
                  color: AppColors.accent700,
                  bgColor: AppColors.accent50,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _buildMetricCard(
                  title: 'Total Revenue',
                  value: '84,500',
                  change: 'ETB (This Month)',
                  icon: Icons.credit_card_outlined,
                  color: const Color(0xFF0D9488),
                  bgColor: const Color(0xFFF0FDFA),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _buildMetricCard(
                  title: 'Placements',
                  value: '52',
                  change: '88% Retention',
                  icon: Icons.trending_up_rounded,
                  color: const Color(0xFFEA580C),
                  bgColor: const Color(0xFFFFF7ED),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Action Queue Banner
          CustomCard(
            padding: const EdgeInsets.all(16),
            backgroundColor: AppColors.warningLight,
            border: const BorderSide(color: Color(0xFFFDE68A)),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: const BoxDecoration(
                    color: Color(0xFFFEF3C7),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.shield_outlined, color: Color(0xFFB45309), size: 20),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('7 Pending Verifications', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF92400E))),
                      Text('4 Nurse licenses, 3 Employer TIN reviews', style: TextStyle(fontSize: 11, color: Color(0xFFB45309))),
                    ],
                  ),
                ),
                CustomButton(
                  label: 'Review',
                  size: ButtonSize.sm,
                  variant: ButtonVariant.primary,
                  onPressed: onOpenVerifications,
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Placement Funnel Breakdown
          CustomCard(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Recruitment Funnel Health', style: AppTypography.h3),
                const SizedBox(height: 4),
                const Text('Conversion across match, interview, and contract phases.', style: AppTypography.bodySmall),
                const SizedBox(height: 16),
                _buildFunnelStage('1. Matched Talent Pool', '148 Candidates', 1.0, AppColors.primary700),
                const SizedBox(height: 10),
                _buildFunnelStage('2. Interview Requests Sent', '94 Requests', 0.64, AppColors.primary500),
                const SizedBox(height: 10),
                _buildFunnelStage('3. Interviews Completed', '72 Sessions', 0.48, AppColors.accent600),
                const SizedBox(height: 10),
                _buildFunnelStage('4. Active Placements', '52 Placements', 0.35, AppColors.success),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricCard({
    required String title,
    required String value,
    required String change,
    required IconData icon,
    required Color color,
    required Color bgColor,
  }) {
    return CustomCard(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: AppTypography.bodySmall),
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(6)),
                child: Icon(icon, size: 16, color: color),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(value, style: AppTypography.h1),
          const SizedBox(height: 4),
          Text(change, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: color)),
        ],
      ),
    );
  }

  Widget _buildFunnelStage(String label, String count, double progress, Color barColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.slate800)),
            Text(count, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.slate900)),
          ],
        ),
        const SizedBox(height: 6),
        ClipRRect(
          borderRadius: BorderRadius.circular(999),
          child: LinearProgressIndicator(
            value: progress,
            minHeight: 8,
            backgroundColor: AppColors.slate100,
            valueColor: AlwaysStoppedAnimation<Color>(barColor),
          ),
        ),
      ],
    );
  }
}
