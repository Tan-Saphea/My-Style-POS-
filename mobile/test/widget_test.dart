import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/main.dart';

void main() {
  testWidgets('MyStyleApp smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const MyStyleApp());
    expect(find.byType(Image), findsWidgets);
    await tester.pumpAndSettle(const Duration(seconds: 3));
  });
}
