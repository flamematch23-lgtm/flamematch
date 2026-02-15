# Export archivio sorgenti

Per creare un archivio completo del progetto (con cartelle e sotto-cartelle), esegui:

```bash
./scripts/export_source_archive.sh
```

L'archivio viene creato in `dist/` con nome tipo:

- `flamematch-source-YYYYMMDD-HHMMSS.tar.gz`

Sono esclusi automaticamente i file non necessari alla compilazione (`.git`, cartelle build, cache gradle).
