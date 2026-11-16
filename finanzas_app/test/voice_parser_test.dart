import 'package:flutter_test/flutter_test.dart';
import 'package:bolsillo_claro/domain/models.dart';
import 'package:bolsillo_claro/domain/voice_parser.dart';

void main() {
  test('separa dos gastos y vincula internet al pago mensual', () {
    const bills = [MonthlyBill(id: 7, title: 'Internet', dueDay: 10, category: 'Servicios')];
    final drafts = VoiceParser.parse(
      'Hoy pagué 30 dólares de internet y compré una torta de 5 dólares',
      bills, DateTime(2026, 11, 7),
    );
    expect(drafts, hasLength(2));
    expect(drafts[0].amountCents, 3000);
    expect(drafts[0].billId, 7);
    expect(drafts[0].isEssential, isTrue);
    expect(drafts[1].amountCents, 500);
    expect(drafts[1].category, 'Comida');
    expect(drafts[1].isEssential, isFalse);
  });

  test('un importe faltante queda pendiente de revisión', () {
    final drafts = VoiceParser.parse('Pagué la luz', [], DateTime(2026, 11, 7));
    expect(drafts.single.amountCents, isNull);
    expect(drafts.single.category, 'Servicios');
  });

  test('un separador de miles no cambia mil dólares a un dólar', () {
    expect(parseMoney('1.000,50'), 100050);
    final drafts = VoiceParser.parse('Recibí 1.000 dólares de sueldo', [], DateTime(2026, 11, 7));
    expect(drafts.single.amountCents, 100000);
  });
}
