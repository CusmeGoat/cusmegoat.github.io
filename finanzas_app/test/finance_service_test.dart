import 'package:flutter_test/flutter_test.dart';
import 'package:bolsillo_claro/domain/finance_service.dart';
import 'package:bolsillo_claro/domain/models.dart';

void main() {
  test('el saldo y el desglose excluyen los ingresos de los gastos', () {
    final movements = [
      Movement(kind: MovementKind.income, title: 'Sueldo', category: 'Ingresos',
        amountCents: 100000, date: DateTime(2026, 11, 1)),
      Movement(kind: MovementKind.expense, title: 'Internet', category: 'Servicios',
        amountCents: 3000, date: DateTime(2026, 11, 2), isEssential: true),
      Movement(kind: MovementKind.expense, title: 'Torta', category: 'Comida',
        amountCents: 500, date: DateTime(2026, 11, 3)),
      Movement(kind: MovementKind.expense, title: 'Anterior', category: 'Otros',
        amountCents: 1000, date: DateTime(2026, 10, 30)),
    ];
    final result = FinanceService.summarize(movements,
      (date) => date.year == 2026 && date.month == 11);
    expect(result.incomeCents, 100000);
    expect(result.expenseCents, 3500);
    expect(result.balanceCents, 96500);
    expect(result.optionalCents, 500);
    expect(result.byCategory, {'Servicios': 3000, 'Comida': 500});
  });

  test('un pago solo aparece como pagado en el mes correspondiente', () {
    const bill = MonthlyBill(id: 3, title: 'Internet', dueDay: 15, category: 'Servicios');
    final movements = [Movement(kind: MovementKind.expense, title: 'Internet',
      category: 'Servicios', amountCents: 3000, date: DateTime(2026, 11, 15), billId: 3)];
    expect(FinanceService.billPaid(bill, movements, DateTime(2026, 11)), isTrue);
    expect(FinanceService.billPaid(bill, movements, DateTime(2026, 12)), isFalse);
  });
}
