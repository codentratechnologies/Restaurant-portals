import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:dineos_customer/main.dart';
import 'package:dineos_customer/presentation/auth/login_screen.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:provider/provider.dart';
import 'package:dineos_customer/state/theme_state.dart';
import 'package:dineos_customer/state/auth_state.dart';
import 'package:dineos_customer/state/cart_state.dart';
import 'package:dineos_customer/state/address_state.dart';
import 'package:dineos_customer/state/order_state.dart';
import 'package:dineos_customer/state/branch_state.dart';
import 'package:dineos_customer/state/support_state.dart';

void main() {
  testWidgets('App startup smoke test', (WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({});

    // Build our app and trigger a frame.
    await tester.pumpWidget(
      MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (_) => ThemeState()),
          ChangeNotifierProvider(create: (_) => AuthState()),
          ChangeNotifierProvider(create: (_) => CartState()),
          ChangeNotifierProvider(create: (_) => AddressState()),
          ChangeNotifierProvider(create: (_) => OrderState()),
          ChangeNotifierProvider(create: (_) => BranchState()),
          ChangeNotifierProvider(create: (_) => SupportState()),
        ],
        child: const MyApp(),
      ),
    );
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 500));

    // Verify that the login screen is displayed initially since the user is unauthenticated
    expect(find.byType(LoginScreen), findsOneWidget);
  });
}
