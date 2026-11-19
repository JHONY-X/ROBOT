import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../shared/widgets/custom_button.dart';
import '../../shared/widgets/custom_card.dart';
import '../../shared/widgets/status_chip.dart';

class CandidateInterviewsScreen extends StatelessWidget {
  const CandidateInterviewsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('My Interviews', style: AppTypography.h1),
          const SizedBox(height: 4),
          const Text('Track incoming employer requests and scheduled sessions.', style: AppTypography.bodySmall),
          const SizedBox(height: 16),

          _buildInterviewCard(
            hospital: 'St. Gabriel General Hospital',
            role: 'Lead Home Care Nurse',
            date: 'Tomorrow, Nov 18 · 10:00 AM',
            format: 'Video Call (Google Meet)',
            status: 'Confirmed',
            type: StatusType.success,
            isUpcoming: true,
          ),
          const SizedBox(height: 12),
          _buildInterviewCard(
            hospital: 'Nordic Medical Centre',
            role: 'Clinical Nurse Specialist',
            date: 'Thursday, Nov 20 · 2:30 PM',
            format: 'On-site · Olympia Branch',
            status: 'Pending Confirmation',
            type: StatusType.warning,
            isUpcoming: true,
          ),
          const SizedBox(height: 24),
          const Text('Past Interviews', style: AppTypography.h2),
          const SizedBox(height: 12),
          _buildInterviewCard(
            hospital: 'Bethel Teaching Hospital',
            role: 'Senior Staff Nurse',
            date: 'Oct 28, 2026',
            format: 'Completed',
            status: 'Placed',
            type: StatusType.success,
            isUpcoming: false,
          ),
        ],
      ),
    );
  }

  Widget _buildInterviewCard({
    required String hospital,
    required String role,
    required String date,
    required String format,
    required String status,
    required StatusType type,
    required bool isUpcoming,
  }) {
    return CustomCard(
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(hospital, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.slate900)),
              ),
              StatusChip(label: status, type: type),
            ],
          ),
          const SizedBox(height: 6),
          Text(role, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.primary700)),
          const SizedBox(height: 12),
          Row(
            children: [
              const Icon(Icons.schedule_rounded, size: 15, color: AppColors.slate500),
              const SizedBox(width: 6),
              Text(date, style: const TextStyle(fontSize: 12, color: AppColors.slate600)),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              const Icon(Icons.videocam_outlined, size: 15, color: AppColors.slate500),
              const SizedBox(width: 6),
              Text(format, style: const TextStyle(fontSize: 12, color: AppColors.slate600)),
            ],
          ),
          if (isUpcoming) ...[
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: CustomButton(
                    label: 'Join Meeting',
                    size: ButtonSize.sm,
                    variant: ButtonVariant.primary,
                    icon: const Icon(Icons.video_call_rounded, size: 16, color: Colors.white),
                    onPressed: () {},
                  ),
                ),
                const SizedBox(width: 8),
                CustomButton(
                  label: 'Reschedule',
                  size: ButtonSize.sm,
                  variant: ButtonVariant.outline,
                  onPressed: () {},
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
