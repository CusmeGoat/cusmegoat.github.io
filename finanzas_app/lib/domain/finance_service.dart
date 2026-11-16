import 'models.dart';

class PeriodSummary {
  const PeriodSummary(this.incomeCents, this.expenseCents, this.optionalCents, this.byCategory);

  final int incomeCents;
  final int expenseCents;
  final int optionalCents;
  final Map<String, int> byCategory;
  int get balanceCents => incomeCents - expenseCents;
}

class FinanceService {
  static PeriodSummary summarize(Iterable<Movement> movements, bool Function(DateTime) inPeriod) {
    var income = 0;
    var expense = 0;
    var optional = 0;
    final categories = <String, int>{};
    for (final movement in movements) {
      if (!inPeriod(movement.date)) continue;
      if (movement.kind == MovementKind.income) {
        income += movement.amountCents;
      } else {
        expense += movement.amountCents;
        if (!movement.isEssential) optional += movement.amountCents;
        categories.update(movement.category, (value) => value + movement.amountCents,
            ifAbsent: () => movement.amountCents);
      }
    }
    return PeriodSummary(income, expense, optional, categories);
  }

  static bool billPaid(MonthlyBill bill, Iterable<Movement> movements, DateTime month) =>
      movements.any((movement) =>
          movement.billId == bill.id &&
          movement.kind == MovementKind.expense &&
          movement.date.year == month.year &&
          movement.date.month == month.month);

  static String recommendation(PeriodSummary current, PeriodSummary previous) {
    if (current.incomeCents == 0 && current.expenseCents == 0) {
      return 'Registra tus movimientos para recibir sugerencias basadas en tus cifras.';
    }
    if (current.balanceCents < 0) {
      return 'Tus gastos superan tus ingresos por ${money(-current.balanceCents)} este mes. Revisa primero los gastos opcionales.';
    }
    if (current.optionalCents > previous.optionalCents && previous.optionalCents > 0) {
      final difference = current.optionalCents - previous.optionalCents;
      return 'Tus gastos opcionales subieron ${money(difference)} frente al mes anterior. Esa cantidad podría reservarse como ahorro.';
    }
    if (current.balanceCents > 0) {
      return 'Te quedan ${money(current.balanceCents)} del período. Puedes asignar una parte a tu meta de ahorro.';
    }
    return 'Tus ingresos y gastos están equilibrados. Revisa si puedes reservar una cantidad fija cada mes.';
  }
}
