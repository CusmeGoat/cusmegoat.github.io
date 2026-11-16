import 'package:flutter/material.dart';
import 'package:speech_to_text/speech_to_text.dart';

class VoiceCaptureSheet extends StatefulWidget {
  const VoiceCaptureSheet({super.key});

  @override
  State<VoiceCaptureSheet> createState() => _VoiceCaptureSheetState();
}

class _VoiceCaptureSheetState extends State<VoiceCaptureSheet> {
  final _speech = SpeechToText();
  final _text = TextEditingController();
  bool _ready = false;
  bool _listening = false;
  String? _error;
  String? _locale;

  @override
  void initState() {
    super.initState();
    _initialize();
  }

  Future<void> _initialize() async {
    try {
      final ready = await _speech.initialize(
        onStatus: (status) {
          if (mounted && status != 'listening') setState(() => _listening = false);
        },
        onError: (error) {
          if (mounted) setState(() {
            _error = 'No se pudo reconocer la voz en el dispositivo. Puedes escribir la frase.';
            _listening = false;
          });
        },
      );
      if (!mounted) return;
      final locales = ready ? await _speech.locales() : <LocaleName>[];
      if (!mounted) return;
      final spanish = locales.where((item) => item.localeId.toLowerCase().startsWith('es'));
      setState(() {
        _ready = ready;
        _locale = spanish.isEmpty ? null : spanish.first.localeId;
        if (!ready) _error = 'El reconocimiento de voz no está disponible. Puedes escribir la frase.';
      });
    } catch (_) {
      if (mounted) setState(() => _error = 'El reconocimiento de voz no está disponible. Puedes escribir la frase.');
    }
  }

  Future<void> _toggle() async {
    if (_listening) {
      await _speech.stop();
      if (mounted) setState(() => _listening = false);
      return;
    }
    if (!_ready) return;
    try {
      setState(() { _error = null; _listening = true; });
      await _speech.listen(
        onResult: (result) {
          if (mounted) setState(() => _text.text = result.recognizedWords);
        },
        listenOptions: SpeechListenOptions(
          onDevice: true,
          listenMode: ListenMode.dictation,
          partialResults: true,
          cancelOnError: true,
          localeId: _locale,
        ),
      );
    } catch (_) {
      if (mounted) setState(() {
        _listening = false;
        _error = 'No hay reconocimiento local disponible para este idioma. Puedes escribir la frase.';
      });
    }
  }

  @override
  void dispose() {
    _speech.cancel();
    _text.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Padding(
    padding: EdgeInsets.fromLTRB(20, 18, 20, MediaQuery.viewInsetsOf(context).bottom + 28),
    child: SingleChildScrollView(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('Registrar con tu voz', style: Theme.of(context).textTheme.headlineSmall),
          const SizedBox(height: 8),
          const Text('Di, por ejemplo: «Pagué 30 dólares de internet y compré una torta de 5». Revisarás cada movimiento antes de guardarlo.'),
          const SizedBox(height: 16),
          Center(child: FilledButton.icon(
            onPressed: _ready ? _toggle : null,
            icon: Icon(_listening ? Icons.stop : Icons.mic),
            label: Text(_listening ? 'Detener' : 'Hablar'),
          )),
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
          ],
          const SizedBox(height: 16),
          TextField(
            controller: _text,
            minLines: 3,
            maxLines: 5,
            decoration: const InputDecoration(
              labelText: 'Texto reconocido o escrito',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 12),
          const Text('La app solicita procesamiento local. Si no está disponible, no envía tu audio a un servidor.'),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: () {
              if (_text.text.trim().isNotEmpty) Navigator.pop(context, _text.text.trim());
            },
            child: const Text('Revisar movimientos'),
          ),
        ],
      ),
    ),
  );
}
