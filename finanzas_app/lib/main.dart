import 'package:flutter/material.dart';

import 'data/finance_repository.dart';
import 'ui/home_page.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final repository = await FinanceRepository.open();
  runApp(BolsilloClaro(repository: repository));
}

class BolsilloClaro extends StatelessWidget {
  const BolsilloClaro({super.key, required this.repository});

  final FinanceRepository repository;

  @override
  Widget build(BuildContext context) => MaterialApp(
    title: 'Bolsillo Claro',
    debugShowCheckedModeBanner: false,
    theme: ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF166C64)),
      scaffoldBackgroundColor: const Color(0xFFF6F8F5),
      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 0,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      ),
    ),
    home: HomePage(repository: repository),
  );
}
