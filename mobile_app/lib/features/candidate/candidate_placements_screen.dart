import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../shared/widgets/custom_card.dart';
import '../../shared/widgets/status_chip.dart';

class CandidatePlacementsScreen extends StatelessWidget {
  const CandidatePlacementsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('My Placements', style: AppTypography.h1),
          const SizedBox(height: 4),
          const Text('Active work agreements and placement history.', style: AppTypography.bodySmall),
          const SizedBox(height: 16),

          CustomCard(
            padding: const EdgeInsets.all(18),
            backgroundColor: AppColors.primary50,
            border: const BorderSide(color: AppColors.primary200),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: const [
                    Text('Active Placement', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.primary900)),
                    StatusChip(label: 'Active', type: StatusType.success),
                  ],
                ),
                const SizedBox(height: 10),
                const Text('Rohobot Specialized Home Care - Team Alpha', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.slate900)),
                const SizedBox(height: 4),
                const Text('Geriatric Palliative Nursing · Full-time', style: TextStyle(fontSize: 12, color: AppColors.slate600)),
                const SizedBox(height: 14),
                const Divider(color: AppColors.primary200),
                const SizedBox(height: 10),
                _buildPlacementDetail('Period', 'Aug 1, 2026 – Present (6 Months)'),
                _buildPlacementDetail('Assigned Patients', '4 Chronic Patients (Bole Area)'),
                _buildPlacementDetail('Clinical Supervisor', 'Dr. Netsanet Degu'),
                _buildPlacementDetail('Monthly Stipend', '18,500 ETB / month'),
              ],
            ),
          ),
          const SizedBox(height: 24),
          const Text('Past Placements', style: AppTypography.h2),
          const SizedBox(height: 12),
          CustomCard(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: const [
                    Text('St. Yared General Hospital', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.slate900)),
                    StatusChip(label: 'Completed', type: StatusType.neutral),
                  ],
                ),
                const SizedBox(height: 4),
                const Text('Intensive Care Ward Nurse · Temporary Contract (6 Months)', style: TextStyle(fontSize: 12, color: AppColors.slate600)),
                const SizedBox(height: 8),
                const Text('Completed Jan 2026 · Evaluation Rating: 4.9 / 5.0', style: TextStyle(fontSize: 11, color: AppColors.slate500)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPlacementDetail(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          SizedBox(
            width: 120,
            child: Text(label, style: const TextStyle(fontSize: 12, color: AppColors.slate600, fontWeight: FontWeight.w500)),
          ),
          Expanded(
            child: Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.slate900)),
          ),
        ],
      ),
    );
  }
}
