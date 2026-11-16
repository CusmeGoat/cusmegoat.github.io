import 'package:path/path.dart' as p;
import 'package:sqflite/sqflite.dart';

import '../domain/models.dart';

class FinanceRepository {
  FinanceRepository._(this._db);

  final Database _db;

  static Future<FinanceRepository> open() async {
    final path = p.join(await getDatabasesPath(), 'bolsillo_claro.db');
    final db = await openDatabase(
      path,
      version: 1,
      onConfigure: (db) async => db.execute('PRAGMA foreign_keys = ON'),
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE bills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            due_day INTEGER NOT NULL CHECK(due_day BETWEEN 1 AND 31),
            category TEXT NOT NULL,
            expected_cents INTEGER CHECK(expected_cents > 0)
          )
        ''');
        await db.execute('''
          CREATE TABLE movements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            kind TEXT NOT NULL CHECK(kind IN ('income', 'expense')),
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            amount_cents INTEGER NOT NULL CHECK(amount_cents > 0),
            date TEXT NOT NULL,
            is_essential INTEGER NOT NULL DEFAULT 0,
            bill_id INTEGER REFERENCES bills(id) ON DELETE SET NULL
          )
        ''');
        await db.execute('CREATE INDEX movements_date_idx ON movements(date)');
      },
    );
    return FinanceRepository._(db);
  }

  Future<List<Movement>> movements() async {
    final rows = await _db.query('movements', orderBy: 'date DESC, id DESC');
    return rows.map((row) => Movement(
      id: row['id'] as int,
      kind: row['kind'] == 'income' ? MovementKind.income : MovementKind.expense,
      title: row['title'] as String,
      category: row['category'] as String,
      amountCents: row['amount_cents'] as int,
      date: DateTime.parse(row['date'] as String),
      isEssential: row['is_essential'] == 1,
      billId: row['bill_id'] as int?,
    )).toList();
  }

  Future<List<MonthlyBill>> bills() async {
    final rows = await _db.query('bills', orderBy: 'due_day, title');
    return rows.map((row) => MonthlyBill(
      id: row['id'] as int,
      title: row['title'] as String,
      dueDay: row['due_day'] as int,
      category: row['category'] as String,
      expectedCents: row['expected_cents'] as int?,
    )).toList();
  }

  Future<void> addMovement(Movement movement) async {
    await _db.insert('movements', {
      'kind': movement.kind.name,
      'title': movement.title.trim(),
      'category': movement.category,
      'amount_cents': movement.amountCents,
      'date': '${movement.date.year.toString().padLeft(4, '0')}-${movement.date.month.toString().padLeft(2, '0')}-${movement.date.day.toString().padLeft(2, '0')}',
      'is_essential': movement.isEssential ? 1 : 0,
      'bill_id': movement.billId,
    });
  }

  Future<void> addBill(MonthlyBill bill) async {
    await _db.insert('bills', {
      'title': bill.title.trim(),
      'due_day': bill.dueDay,
      'category': bill.category,
      'expected_cents': bill.expectedCents,
    });
  }

  Future<void> deleteMovement(int id) async {
    await _db.delete('movements', where: 'id = ?', whereArgs: [id]);
  }

  Future<void> deleteBill(int id) async {
    await _db.delete('bills', where: 'id = ?', whereArgs: [id]);
  }

  Future<void> close() => _db.close();
}
