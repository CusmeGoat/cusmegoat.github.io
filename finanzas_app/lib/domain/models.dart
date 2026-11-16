enum MovementKind { income, expense }

class Movement {
  const Movement({
    this.id,
    required this.kind,
    required this.title,
    required this.category,
    required this.amountCents,
    required this.date,
    this.isEssential = false,
    this.billId,
  });

  final int? id;
  final MovementKind kind;
  final String title;
  final String category;
  final int amountCents;
  final DateTime date;
  final bool isEssential;
  final int? billId;
}

class MonthlyBill {
  const MonthlyBill({
    this.id,
    required this.title,
    required this.dueDay,
    required this.category,
    this.expectedCents,
  });

  final int? id;
  final String title;
  final int dueDay;
  final String category;
  final int? expectedCents;
}

class MovementDraft {
  const MovementDraft({
    required this.title,
    required this.kind,
    required this.category,
    required this.date,
    this.amountCents,
    this.isEssential = false,
    this.billId,
  });

  final String title;
  final MovementKind kind;
  final String category;
  final DateTime date;
  final int? amountCents;
  final bool isEssential;
  final int? billId;
}

String money(int cents) => cents < 0
    ? '-\$${(-cents / 100).toStringAsFixed(2)}'
    : '\$${(cents / 100).toStringAsFixed(2)}';

int? parseMoney(String raw) {
  var value = raw.trim().replaceAll(RegExp(r'[^\d,.]'), '');
  if (value.isEmpty) return null;
  if (value.contains(',') && value.contains('.')) {
    final decimalSeparator = value.lastIndexOf(',') > value.lastIndexOf('.') ? ',' : '.';
    final groupSeparator = decimalSeparator == ',' ? '.' : ',';
    value = value.replaceAll(groupSeparator, '').replaceAll(decimalSeparator, '.');
  } else if (RegExp(r'^\d{1,3}([.,]\d{3})+$').hasMatch(value)) {
    value = value.replaceAll(RegExp(r'[.,]'), '');
  } else if (RegExp(r'^\d+[.,]\d{1,2}$').hasMatch(value)) {
    value = value.replaceAll(',', '.');
  } else if (!RegExp(r'^\d+$').hasMatch(value)) {
    return null;
  }
  final parsed = double.tryParse(value);
  if (parsed == null || !parsed.isFinite || parsed <= 0) return null;
  return (parsed * 100).round();
}
