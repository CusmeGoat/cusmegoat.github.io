import 'package:flutter/material.dart';

import '../data/finance_repository.dart';
import '../domain/finance_service.dart';
import '../domain/models.dart';
import '../domain/voice_parser.dart';
import 'voice_capture_sheet.dart';

const categories = ['Comida', 'Servicios', 'Vivienda', 'Transporte', 'Salud', 'Ocio', 'Compras', 'Otros'];
const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

class HomePage extends StatefulWidget {
  const HomePage({super.key, required this.repository});
  final FinanceRepository repository;

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  List<Movement> _movements = [];
  List<MonthlyBill> _bills = [];
  DateTime _month = DateTime(DateTime.now().year, DateTime.now().month);
  bool _busy = true;
  int _tab = 0;

  @override
  void initState() {
    super.initState();
    _reload();
  }

  Future<void> _reload() async {
    final movements = await widget.repository.movements();
    final bills = await widget.repository.bills();
    if (!mounted) return;
    setState(() { _movements = movements; _bills = bills; _busy = false; });
  }

  PeriodSummary _summary(DateTime month) => FinanceService.summarize(
    _movements, (date) => date.year == month.year && date.month == month.month,
  );

  Future<void> _voice() async {
    final transcript = await showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (_) => const VoiceCaptureSheet(),
    );
    if (!mounted || transcript == null) return;
    final drafts = VoiceParser.parse(transcript, _bills, DateTime.now());
    if (drafts.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('No encontré movimientos. Prueba con «pagué 5 de comida».')));
      return;
    }
    for (final draft in drafts) {
      if (!mounted) break;
      await _addMovement(initial: draft);
    }
  }

  Future<void> _addMovement({MovementDraft? initial}) async {
    final title = TextEditingController(text: initial?.title ?? '');
    final amount = TextEditingController(text: initial?.amountCents == null ? '' : (initial!.amountCents! / 100).toStringAsFixed(2));
    var kind = initial?.kind ?? MovementKind.expense;
    var category = initial?.category ?? 'Otros';
    var essential = initial?.isEssential ?? false;
    var date = initial?.date ?? DateTime.now();
    String? error;
    final movement = await showDialog<Movement>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (context, update) => AlertDialog(
          title: Text(initial == null ? 'Nuevo movimiento' : 'Revisar movimiento'),
          content: SingleChildScrollView(child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              SegmentedButton<MovementKind>(
                segments: const [
                  ButtonSegment(value: MovementKind.expense, label: Text('Gasto')),
                  ButtonSegment(value: MovementKind.income, label: Text('Ingreso')),
                ],
                selected: {kind},
                onSelectionChanged: (value) => update(() => kind = value.first),
              ),
              const SizedBox(height: 14),
              TextField(controller: title, textCapitalization: TextCapitalization.sentences,
                  decoration: const InputDecoration(labelText: 'Descripción', border: OutlineInputBorder())),
              const SizedBox(height: 12),
              TextField(controller: amount, keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  decoration: const InputDecoration(labelText: 'Importe', prefixText: '\$ ', border: OutlineInputBorder())),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                initialValue: categories.contains(category) ? category : 'Otros',
                decoration: const InputDecoration(labelText: 'Categoría', border: OutlineInputBorder()),
                items: categories.map((value) => DropdownMenuItem(value: value, child: Text(value))).toList(),
                onChanged: (value) => update(() => category = value ?? category),
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: () async {
                  final picked = await showDatePicker(context: context, initialDate: date,
                      firstDate: DateTime(2000), lastDate: DateTime(2100));
                  if (picked != null) update(() => date = picked);
                },
                icon: const Icon(Icons.calendar_today_outlined),
                label: Text('${date.day}/${date.month}/${date.year}'),
              ),
              if (kind == MovementKind.expense)
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  title: const Text('Gasto necesario'),
                  value: essential,
                  onChanged: (value) => update(() => essential = value),
                ),
              if (error != null) Text(error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
            ],
          )),
          actions: [
            TextButton(onPressed: () => Navigator.pop(dialogContext), child: const Text('Omitir')),
            FilledButton(onPressed: () {
              final cents = parseMoney(amount.text);
              if (title.text.trim().isEmpty || cents == null) {
                update(() => error = 'Escribe una descripción y un importe mayor que cero.');
                return;
              }
              Navigator.pop(dialogContext, Movement(
                kind: kind, title: title.text.trim(), category: kind == MovementKind.income ? 'Ingresos' : category,
                amountCents: cents, date: date, isEssential: kind == MovementKind.expense && essential,
                billId: kind == MovementKind.expense ? initial?.billId : null,
              ));
            }, child: const Text('Guardar')),
          ],
        ),
      ),
    );
    title.dispose();
    amount.dispose();
    if (movement == null) return;
    if (movement.billId != null) {
      final bill = _bills.where((item) => item.id == movement.billId).firstOrNull;
      if (bill != null && FinanceService.billPaid(bill, _movements, movement.date)) {
        if (!mounted) return;
        final again = await showDialog<bool>(context: context, builder: (context) => AlertDialog(
          title: const Text('Pago ya registrado'),
          content: Text('«${bill.title}» ya figura como pagado en este mes. ¿Quieres registrar otro gasto?'),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancelar')),
            FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Registrar otro')),
          ],
        ));
        if (again != true) return;
      }
    }
    await widget.repository.addMovement(movement);
    await _reload();
  }

  Future<void> _addBill() async {
    final title = TextEditingController();
    final amount = TextEditingController();
    final day = TextEditingController(text: '1');
    var category = 'Servicios';
    String? error;
    final bill = await showDialog<MonthlyBill>(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (context, update) => AlertDialog(
          title: const Text('Nuevo pago mensual'),
          content: SingleChildScrollView(child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: title, decoration: const InputDecoration(labelText: 'Nombre', border: OutlineInputBorder())),
              const SizedBox(height: 12),
              TextField(controller: amount, keyboardType: const TextInputType.numberWithOptions(decimal: true),
                  decoration: const InputDecoration(labelText: 'Importe previsto (opcional)', prefixText: '\$ ', border: OutlineInputBorder())),
              const SizedBox(height: 12),
              TextField(controller: day, keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Día de vencimiento (1-31)', border: OutlineInputBorder())),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                initialValue: category,
                decoration: const InputDecoration(labelText: 'Categoría', border: OutlineInputBorder()),
                items: categories.map((value) => DropdownMenuItem(value: value, child: Text(value))).toList(),
                onChanged: (value) => update(() => category = value ?? category),
              ),
              if (error != null) Text(error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
            ],
          )),
          actions: [
            TextButton(onPressed: () => Navigator.pop(dialogContext), child: const Text('Cancelar')),
            FilledButton(onPressed: () {
              final dueDay = int.tryParse(day.text);
              final expected = amount.text.trim().isEmpty ? null : parseMoney(amount.text);
              if (title.text.trim().isEmpty || dueDay == null || dueDay < 1 || dueDay > 31 ||
                  (amount.text.trim().isNotEmpty && expected == null)) {
                update(() => error = 'Completa el nombre, un día válido y un importe positivo si lo indicas.');
                return;
              }
              Navigator.pop(dialogContext, MonthlyBill(
                title: title.text.trim(), dueDay: dueDay, category: category, expectedCents: expected,
              ));
            }, child: const Text('Guardar')),
          ],
        ),
      ),
    );
    title.dispose(); amount.dispose(); day.dispose();
    if (bill == null) return;
    await widget.repository.addBill(bill);
    await _reload();
  }

  Future<void> _deleteMovement(Movement movement) async {
    final confirmed = await showDialog<bool>(context: context, builder: (context) => AlertDialog(
      title: const Text('Eliminar movimiento'),
      content: Text('¿Eliminar «${movement.title}»?'),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancelar')),
        FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Eliminar')),
      ],
    ));
    if (confirmed != true) return;
    await widget.repository.deleteMovement(movement.id!);
    await _reload();
  }

  @override
  Widget build(BuildContext context) {
    final current = _summary(_month);
    final previous = _summary(DateTime(_month.year, _month.month - 1));
    final annual = FinanceService.summarize(_movements, (date) => date.year == _month.year);
    final monthly = _movements.where((m) => m.date.year == _month.year && m.date.month == _month.month).toList();
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bolsillo Claro', style: TextStyle(fontWeight: FontWeight.w700)),
        backgroundColor: const Color(0xFFF6F8F5),
        actions: [IconButton(onPressed: _voice, tooltip: 'Registrar con voz', icon: const Icon(Icons.mic_none))],
      ),
      body: _busy ? const Center(child: CircularProgressIndicator()) : Column(children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            IconButton(onPressed: () => setState(() => _month = DateTime(_month.year, _month.month - 1)), icon: const Icon(Icons.chevron_left)),
            Text('${months[_month.month - 1]} ${_month.year}', style: Theme.of(context).textTheme.titleLarge),
            IconButton(onPressed: () => setState(() => _month = DateTime(_month.year, _month.month + 1)), icon: const Icon(Icons.chevron_right)),
          ]),
        ),
        Expanded(child: ListView(padding: const EdgeInsets.fromLTRB(16, 4, 16, 100), children: [
          if (_tab == 0) _dashboard(current, previous, annual),
          if (_tab == 1) _movementList(monthly),
          if (_tab == 2) _billList(),
        ])),
      ]),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _tab == 2 ? _addBill : () => _addMovement(),
        icon: const Icon(Icons.add),
        label: Text(_tab == 2 ? 'Nuevo pago' : 'Movimiento'),
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _tab,
        onDestinationSelected: (value) => setState(() => _tab = value),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.pie_chart_outline), label: 'Resumen'),
          NavigationDestination(icon: Icon(Icons.receipt_long_outlined), label: 'Movimientos'),
          NavigationDestination(icon: Icon(Icons.checklist_outlined), label: 'Pagos'),
        ],
      ),
    );
  }

  Widget _dashboard(PeriodSummary current, PeriodSummary previous, PeriodSummary annual) {
    final sorted = current.byCategory.entries.toList()..sort((a, b) => b.value.compareTo(a.value));
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      Card(child: Padding(padding: const EdgeInsets.all(22), child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Saldo del mes'),
          const SizedBox(height: 6),
          Text(money(current.balanceCents), style: Theme.of(context).textTheme.headlineLarge?.copyWith(
            fontWeight: FontWeight.bold,
            color: current.balanceCents < 0 ? Theme.of(context).colorScheme.error : const Color(0xFF166C64),
          )),
          const SizedBox(height: 20),
          Row(children: [
            Expanded(child: _metric('Ingresos', current.incomeCents, Icons.arrow_downward, const Color(0xFF166C64))),
            Expanded(child: _metric('Gastos', current.expenseCents, Icons.arrow_upward, const Color(0xFFB35A3C))),
          ]),
        ],
      ))),
      const SizedBox(height: 12),
      Card(child: Padding(padding: const EdgeInsets.all(20), child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Vista anual · ${_month.year}', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          Text('Ingresos ${money(annual.incomeCents)}  ·  Gastos ${money(annual.expenseCents)}'),
          Text('Saldo ${money(annual.balanceCents)}', style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ))),
      const SizedBox(height: 12),
      Card(child: Padding(padding: const EdgeInsets.all(20), child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Gastos por categoría', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 12),
          if (sorted.isEmpty) const Text('Aún no hay gastos en este mes.'),
          for (final entry in sorted) ...[
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Text(entry.key), Text(money(entry.value))]),
            const SizedBox(height: 5),
            LinearProgressIndicator(value: current.expenseCents == 0 ? 0 : entry.value / current.expenseCents,
                minHeight: 7, borderRadius: BorderRadius.circular(8)),
            const SizedBox(height: 12),
          ],
        ],
      ))),
      const SizedBox(height: 12),
      Card(child: Padding(padding: const EdgeInsets.all(20), child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Sugerencia del mes', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          Text(FinanceService.recommendation(current, previous)),
          const SizedBox(height: 8),
          Text('Gastos opcionales: ${money(current.optionalCents)}'),
        ],
      ))),
    ]);
  }

  Widget _metric(String label, int value, IconData icon, Color color) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Row(children: [Icon(icon, color: color, size: 18), const SizedBox(width: 4), Text(label)]),
      Text(money(value), style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: color)),
    ],
  );

  Widget _movementList(List<Movement> monthly) => Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      Text('Movimientos del mes', style: Theme.of(context).textTheme.titleLarge),
      const SizedBox(height: 10),
      if (monthly.isEmpty) const Card(child: Padding(padding: EdgeInsets.all(24), child: Text('Aún no hay movimientos. Añade uno con el botón inferior o usa el micrófono.'))),
      for (final movement in monthly)
        Card(child: ListTile(
          leading: CircleAvatar(child: Icon(movement.kind == MovementKind.income ? Icons.south_west : Icons.north_east)),
          title: Text(movement.title),
          subtitle: Text('${movement.category} · ${movement.date.day}/${movement.date.month}/${movement.date.year}${movement.kind == MovementKind.expense ? (movement.isEssential ? ' · Necesario' : ' · Opcional') : ''}'),
          trailing: Row(mainAxisSize: MainAxisSize.min, children: [
            Text('${movement.kind == MovementKind.income ? '+' : '-'}${money(movement.amountCents)}',
                style: const TextStyle(fontWeight: FontWeight.bold)),
            PopupMenuButton<String>(onSelected: (_) => _deleteMovement(movement),
              itemBuilder: (_) => const [PopupMenuItem(value: 'delete', child: Text('Eliminar'))]),
          ]),
        )),
    ],
  );

  Widget _billList() => Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      Text('Pagos mensuales', style: Theme.of(context).textTheme.titleLarge),
      const SizedBox(height: 4),
      const Text('Al registrar el pago, también se añade el gasto al resumen.'),
      const SizedBox(height: 10),
      if (_bills.isEmpty) const Card(child: Padding(padding: EdgeInsets.all(24), child: Text('Añade internet, luz u otros pagos que se repiten cada mes.'))),
      for (final bill in _bills)
        Card(child: ListTile(
          leading: Icon(FinanceService.billPaid(bill, _movements, _month) ? Icons.check_circle : Icons.radio_button_unchecked,
              color: FinanceService.billPaid(bill, _movements, _month) ? const Color(0xFF166C64) : null),
          title: Text(bill.title),
          subtitle: Text('Vence el día ${bill.dueDay}${bill.expectedCents == null ? '' : ' · previsto ${money(bill.expectedCents!)}'}'),
          trailing: FinanceService.billPaid(bill, _movements, _month)
              ? const Text('Pagado')
              : TextButton(onPressed: () => _addMovement(initial: MovementDraft(
                  title: bill.title, kind: MovementKind.expense, category: bill.category,
                  date: DateTime(_month.year, _month.month,
                    _month.year == DateTime.now().year && _month.month == DateTime.now().month
                      ? DateTime.now().day : 1),
                  amountCents: bill.expectedCents, isEssential: true, billId: bill.id,
                )), child: const Text('Registrar')),
          onLongPress: () async {
            final confirmed = await showDialog<bool>(context: context, builder: (context) => AlertDialog(
              title: const Text('Eliminar pago mensual'), content: Text('¿Eliminar «${bill.title}»? Los gastos ya registrados se conservarán.'),
              actions: [TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancelar')),
                FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Eliminar'))],
            ));
            if (confirmed == true) { await widget.repository.deleteBill(bill.id!); await _reload(); }
          },
        )),
    ],
  );
}
