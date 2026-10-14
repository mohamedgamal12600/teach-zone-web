import 'package:flutter/material.dart';
import 'screens/splash.dart';
import 'screens/home.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});
  @override
  Widget build(BuildContext context) => MaterialApp(
    title: 'TechZone',
    home: const SplashScreen(),
    routes: {
      '/home': (context) => const HomeScreen(),
    },
  );
}