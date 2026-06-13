import 'package:flutter/material.dart';
import 'core/theme.dart';
import 'core/state.dart';
import 'modules/auth/login_screen.dart';
import 'modules/delivery/home_screen.dart';
import 'modules/delivery/accepted_order_screen.dart';
import 'modules/delivery/order_request_popup.dart';
import 'modules/history/history_screen.dart';
import 'modules/profile/profile_screen.dart';
import 'widgets/custom_bottom_nav.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  await AppState().loadPersistedState();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: AppState(),
      builder: (context, _) {
        final state = AppState();
        return MaterialApp(
          title: 'DineOs Delivery',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.getLightTheme(),
          darkTheme: AppTheme.getDarkTheme(),
          themeMode: state.isThemeDark ? ThemeMode.dark : ThemeMode.light,
          home: const MainAppWrapper(),
        );
      },
    );
  }
}

class MainAppWrapper extends StatelessWidget {
  const MainAppWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: AppState(),
      builder: (context, _) {
        final state = AppState();

        // Screen 1: Auth screen if not logged in
        if (!state.isLoggedIn) {
          return const LoginScreen();
        }

        // Render main workspace
        Widget currentScreen;
        if (state.activeOrder != null) {
          // Screen 3: If carrying active order, display the Tracking/Transit view
          currentScreen = const AcceptedOrderScreen();
        } else {
          // Swapping based on bottom tabs
          switch (state.activeTab) {
            case 0:
              currentScreen = const HomeScreen();
              break;
            case 1:
              currentScreen = const HistoryScreen();
              break;
            case 2:
              currentScreen = const ProfileScreen();
              break;
            default:
              currentScreen = const HomeScreen();
          }
        }

        return Stack(
          children: [
            Scaffold(
              body: currentScreen,
              // Only display bottom nav bar if the rider doesn't have an active order
              bottomNavigationBar: state.activeOrder == null
                  ? CustomBottomNav(
                      currentIndex: state.activeTab,
                      onTap: (index) {
                        state.setTab(index);
                      },
                    )
                  : null,
            ),

            // Screen 2.1: Bouncing Order Request Popup overlay when active request arrives
            if (state.activeRequest != null)
              const Positioned.fill(
                child: OrderRequestPopup(),
              ),
          ],
        );
      },
    );
  }
}
