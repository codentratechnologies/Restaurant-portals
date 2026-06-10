import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/theme/colors.dart';
import 'core/theme/app_theme.dart';
import 'state/theme_state.dart';
import 'state/auth_state.dart';
import 'state/cart_state.dart';
import 'state/address_state.dart';
import 'state/order_state.dart';
import 'state/branch_state.dart';
import 'presentation/auth/login_screen.dart';
import 'presentation/main_navigation.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeState()),
        ChangeNotifierProvider(create: (_) => AuthState()),
        ChangeNotifierProvider(create: (_) => CartState()),
        ChangeNotifierProvider(create: (_) => AddressState()),
        ChangeNotifierProvider(create: (_) => OrderState()),
        ChangeNotifierProvider(create: (_) => BranchState()),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    final themeState = Provider.of<ThemeState>(context);

    return MaterialApp(
      title: 'DineOS Customer',
      debugShowCheckedModeBanner: false,
      themeMode: themeState.themeMode,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      home: const AppStartupWrapper(),
    );
  }
}

class AppStartupWrapper extends StatefulWidget {
  const AppStartupWrapper({super.key});

  @override
  State<AppStartupWrapper> createState() => _AppStartupWrapperState();
}

class _AppStartupWrapperState extends State<AppStartupWrapper> {
  bool _initialized = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_initialized) {
      final authState = Provider.of<AuthState>(context);
      if (!authState.isInitializing) {
        _initialized = true;
        if (authState.isAuthenticated) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            Provider.of<AddressState>(context, listen: false).loadAddresses();
            Provider.of<OrderState>(context, listen: false).loadOrders();
          });
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = Provider.of<AuthState>(context);
    if (authState.isInitializing) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
      );
    }
    return authState.isAuthenticated ? const MainNavigation() : const LoginScreen();
  }
}
