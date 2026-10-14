Copy assets/ and lib/screens/splash.dart into your Flutter project, then:

  flutter pub add --dev flutter_launcher_icons flutter_native_splash
  (paste pubspec_snippet.yaml blocks into pubspec.yaml)
  flutter pub get
  dart run flutter_launcher_icons
  dart run flutter_native_splash:create
  flutter clean
  flutter run

main.dart:  home: const SplashScreen(),   (import 'screens/splash.dart';)
