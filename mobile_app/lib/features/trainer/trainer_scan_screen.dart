import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../shared/widgets/custom_button.dart';
import '../../shared/widgets/custom_card.dart';

class TrainerScanScreen extends StatefulWidget {
  const TrainerScanScreen({super.key});

  @override
  State<TrainerScanScreen> createState() => _TrainerScanScreenState();
}

class _TrainerScanScreenState extends State<TrainerScanScreen> {
  final _tokenController = TextEditingController();
  bool _isVerified = false;
  String? _candidateName;

  void _verifyCode() {
    final code = _tokenController.text.trim();
    if (code.isEmpty) return;

    setState(() {
      _isVerified = true;
      _candidateName = 'Selamawit Alemu (RN-4902)';
    });
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 440),
          child: CustomCard(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Center(
                  child: Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      color: AppColors.primary50,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Icon(Icons.qr_code_scanner_rounded, size: 32, color: AppColors.primary700),
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Training Attendance Verification',
                  style: AppTypography.h2,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 6),
                const Text(
                  'Scan candidate badge or enter the 6-digit training verification code.',
                  style: AppTypography.bodySmall,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),

                // Simulated Scanner Viewfinder
                Container(
                  height: 180,
                  decoration: BoxDecoration(
                    color: Colors.black,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      Container(
                        width: 120,
                        height: 120,
                        decoration: BoxDecoration(
                          border: Border.all(color: AppColors.accent500, width: 2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      const Text(
                        'Camera viewfinder active\nAlign QR code within frame',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: Colors.white70, fontSize: 11),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Manual Token Entry
                TextField(
                  controller: _tokenController,
                  decoration: const InputDecoration(
                    labelText: 'Verification Token / Code',
                    hintText: 'e.g. TRN-882194',
                    prefixIcon: Icon(Icons.pin_outlined),
                  ),
                ),
                const SizedBox(height: 14),
                CustomButton(
                  label: 'Verify Attendance',
                  size: ButtonSize.lg,
                  variant: ButtonVariant.primary,
                  onPressed: _verifyCode,
                ),

                if (_isVerified) ...[
                  const SizedBox(height: 20),
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.successLight,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFA7F3D0)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.check_circle_rounded, color: AppColors.success, size: 24),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Attendance Recorded!', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF065F46))),
                              Text(_candidateName ?? '', style: const TextStyle(fontSize: 12, color: Color(0xFF047857))),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
