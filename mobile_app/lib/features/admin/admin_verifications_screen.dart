import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../shared/widgets/custom_button.dart';
import '../../shared/widgets/custom_card.dart';
import '../../shared/widgets/status_chip.dart';

class VerificationItem {
  final String id;
  final String name;
  final String type; // 'Candidate' | 'Employer'
  final String category;
  final String date;
  String status;

  VerificationItem({
    required this.id,
    required this.name,
    required this.type,
    required this.category,
    required this.date,
    this.status = 'Pending',
  });
}

class AdminVerificationsScreen extends StatefulWidget {
  const AdminVerificationsScreen({super.key});

  @override
  State<AdminVerificationsScreen> createState() => _AdminVerificationsScreenState();
}

class _AdminVerificationsScreenState extends State<AdminVerificationsScreen> {
  final List<VerificationItem> _items = [
    VerificationItem(
      id: '1',
      name: 'Bethlehem Tadesse',
      type: 'Candidate',
      category: 'Nursing License Level IV',
      date: 'Nov 16, 2026',
    ),
    VerificationItem(
      id: '2',
      name: 'Addis Care General Hospital',
      type: 'Employer',
      category: 'Commercial Registration & TIN',
      date: 'Nov 15, 2026',
    ),
    VerificationItem(
      id: '3',
      name: 'Yonas Mengistu',
      type: 'Candidate',
      category: 'Physiotherapy Board Certificate',
      date: 'Nov 14, 2026',
    ),
    VerificationItem(
      id: '4',
      name: 'Tena Home Care PLC',
      type: 'Employer',
      category: 'Healthcare Facility License',
      date: 'Nov 13, 2026',
    ),
  ];

  void _handleStatus(VerificationItem item, String newStatus) {
    setState(() {
      item.status = newStatus;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('${item.name} marked as $newStatus')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Verification Center', style: AppTypography.h1),
          const SizedBox(height: 4),
          const Text(
            'Review government credentials, professional licenses, and organization records.',
            style: AppTypography.bodySmall,
          ),
          const SizedBox(height: 16),

          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _items.length,
            itemBuilder: (context, index) {
              final item = _items[index];
              return Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: CustomCard(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              item.name,
                              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.slate900),
                            ),
                          ),
                          StatusChip(
                            label: item.status,
                            type: item.status == 'Approved'
                                ? StatusType.success
                                : (item.status == 'Rejected' ? StatusType.error : StatusType.warning),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: item.type == 'Employer' ? AppColors.accent50 : AppColors.primary50,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              item.type,
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: item.type == 'Employer' ? AppColors.accent700 : AppColors.primary700,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(item.category, style: const TextStyle(fontSize: 12, color: AppColors.slate600)),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text('Submitted: ${item.date}', style: const TextStyle(fontSize: 11, color: AppColors.slate400)),
                      if (item.status == 'Pending') ...[
                        const SizedBox(height: 14),
                        Row(
                          children: [
                            Expanded(
                              child: CustomButton(
                                label: 'Approve',
                                size: ButtonSize.sm,
                                variant: ButtonVariant.secondary,
                                icon: const Icon(Icons.check_circle_outline_rounded, size: 16, color: AppColors.primary700),
                                onPressed: () => _handleStatus(item, 'Approved'),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: CustomButton(
                                label: 'Reject',
                                size: ButtonSize.sm,
                                variant: ButtonVariant.outline,
                                icon: const Icon(Icons.cancel_outlined, size: 16, color: AppColors.error),
                                onPressed: () => _handleStatus(item, 'Rejected'),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
