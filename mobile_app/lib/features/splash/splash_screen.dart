import 'dart:async';

import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

class SplashScreen extends StatefulWidget {
  final VoidCallback onFinish;
  const SplashScreen({super.key, required this.onFinish});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  bool _finished = false;
  bool _loaded = false;
  Timer? _timer;

  // Duration the GIF plays before auto-advancing.
  // Tap anywhere on screen to skip.
  static const Duration _splashDuration = Duration(seconds: 5);

  @override
  void initState() {
    super.initState();
    _timer = Timer(_splashDuration, _completeSplash);
  }

  void _completeSplash() {
    if (!_finished && mounted) {
      _finished = true;
      _timer?.cancel();
      widget.onFinish();
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: GestureDetector(
        onTap: _completeSplash,
        child: SizedBox.expand(
          child: Image.asset(
            'assets/images/splash_screen.gif',
            fit: BoxFit.cover,
            frameBuilder: (context, child, frame, wasSynchronouslyLoaded) {
              if (frame != null && !_loaded) {
                // First frame decoded — GIF is ready.
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  if (mounted) setState(() => _loaded = true);
                });
              }
              // Show a black screen until the first frame is ready.
              return AnimatedOpacity(
                opacity: (frame != null) ? 1.0 : 0.0,
                duration: const Duration(milliseconds: 300),
                child: child,
              );
            },
            errorBuilder: (context, error, stackTrace) {
              // Fallback: show logo + spinner if GIF fails to load.
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Image.asset(
                      'assets/images/rohobot-logo.png',
                      width: 100,
                      height: 100,
                      errorBuilder: (_, _, _) => const Icon(
                        Icons.local_hospital_rounded,
                        color: AppColors.primary500,
                        size: 64,
                      ),
                    ),
                    const SizedBox(height: 20),
                    const CircularProgressIndicator(
                      color: AppColors.accent600,
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}
