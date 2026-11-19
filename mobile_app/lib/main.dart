import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'navigation/app_router.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const RohobotMobileApp());
}

class RohobotMobileApp extends StatelessWidget {
  const RohobotMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Rohobot Healthcare',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const AppRouter(),
    );
  }
}
