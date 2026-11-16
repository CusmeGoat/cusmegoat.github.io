import 'models.dart';

class VoiceParser {
  static final _amount = RegExp(r'(?<![\d.,])(?:\$\s*|usd\s*)?(?:\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{1,2})?|\d+(?:[.,]\d{1,2})?)(?![\d.,])', caseSensitive: false);
  static final _split = RegExp(
    r'\s*(?:,|;|\by\b|\btambién\b|\bademás\b)\s*(?=(?:me\s+)?(?:pagu[eé]|compr[eé]|gast[eé]|recib[ií]|cobr[eé]|gan[eé]|ingres[eé]))',
    caseSensitive: false,
  );

  static List<MovementDraft> parse(String transcript, List<MonthlyBill> bills, DateTime today) {
    final drafts = <MovementDraft>[];
    for (final part in transcript.split(_split)) {
      final phrase = part.trim();
      if (phrase.isEmpty) continue;
      final normalized = _normalize(phrase);
      final income = RegExp(r'\b(recibi|cobre|gane|ingrese|sueldo|salario)\b').hasMatch(normalized);
      final match = _amount.firstMatch(normalized);
      final cents = match == null ? null : parseMoney(match.group(0)!);
      var title = normalized
          .replaceAll(_amount, ' ')
          .replaceAll(RegExp(r'\b(hoy|ayer|el dia de|me|pague|compre|gaste|recibi|cobre|gane|ingrese|en|de|por|una|un|la|el|los|las|dolares|dolar|usd)\b'), ' ')
          .replaceAll(RegExp(r'\s+'), ' ')
          .trim();
      if (title.isEmpty) title = income ? 'Ingreso' : 'Gasto';
      final bill = bills.where((item) => normalized.contains(_normalize(item.title))).firstOrNull;
      final category = income ? 'Ingresos' : bill?.category ?? _category(normalized);
      drafts.add(MovementDraft(
        title: _capitalize(title),
        kind: income ? MovementKind.income : MovementKind.expense,
        category: category,
        date: normalized.contains('ayer') ? today.subtract(const Duration(days: 1)) : today,
        amountCents: cents,
        isEssential: bill != null || _essential(normalized),
        billId: bill?.id,
      ));
    }
    return drafts;
  }

  static String _normalize(String value) => value.toLowerCase()
      .replaceAll(RegExp('[áàä]'), 'a').replaceAll(RegExp('[éèë]'), 'e')
      .replaceAll(RegExp('[íìï]'), 'i').replaceAll(RegExp('[óòö]'), 'o')
      .replaceAll(RegExp('[úùü]'), 'u');

  static String _capitalize(String value) => value[0].toUpperCase() + value.substring(1);

  static bool _essential(String text) => RegExp(r'\b(internet|luz|electricidad|agua|alquiler|arriendo|renta|medicina|farmacia|transporte)\b').hasMatch(text);

  static String _category(String text) {
    if (RegExp(r'\b(internet|telefono|celular)\b').hasMatch(text)) return 'Servicios';
    if (RegExp(r'\b(luz|electricidad|agua|gas)\b').hasMatch(text)) return 'Servicios';
    if (RegExp(r'\b(alquiler|arriendo|renta)\b').hasMatch(text)) return 'Vivienda';
    if (RegExp(r'\b(torta|pastel|cafe|restaurante|comida|almuerzo|desayuno)\b').hasMatch(text)) return 'Comida';
    if (RegExp(r'\b(bus|taxi|gasolina|transporte)\b').hasMatch(text)) return 'Transporte';
    if (RegExp(r'\b(medicina|farmacia|medico)\b').hasMatch(text)) return 'Salud';
    return 'Otros';
  }
}
