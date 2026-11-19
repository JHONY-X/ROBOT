// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter_test/flutter_test.dart';

import 'package:rohobot_mobile/rohobot_app.dart';

void main() {
  testWidgets('landing page displays Rohobot pathways', (tester) async {
    await tester.pumpWidget(const RohobotApp());

    expect(find.text('Better connections for '), findsNothing);
    expect(find.textContaining('Better connections for'), findsOneWidget);
    expect(find.text('Healthcare professionals'), findsOneWidget);
    expect(find.text('Healthcare employers'), findsOneWidget);
  });

  testWidgets('candidate sign in opens from the landing page', (tester) async {
    await tester.pumpWidget(const RohobotApp());
    await tester.tap(find.text('Candidate sign in').first);
    await tester.pumpAndSettle();

    expect(find.text('Sign in to Rohobot'), findsOneWidget);
    expect(find.text('Email address'), findsOneWidget);
  });
}
