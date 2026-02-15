# Cloud Functions contract (partita)

## Trigger principale

- `onCreate` su `tables/{tableId}/commands/{commandId}`
- La function acquisisce lock logico via **transazione Firestore** sul documento tavolo.

## Pipeline server

1. Carica `tables/{tableId}`.
2. Verifica idempotenza (`commands/{commandId}.status` non già `APPLIED`).
3. Valida `expectedVersion` e `turnToken`.
4. Esegue engine (`shuffle/deal/validate/apply/settle`).
5. Scrive in una singola transazione:
   - update `tables/{tableId}` con `version + 1`;
   - append `events/{eventId}`;
   - update comando a `APPLIED` o `REJECTED`.

## Timeout turno

- Scheduled function (ogni 1s/5s):
  - query tavoli con `turn.decisionDeadlineAt < now`;
  - genera comando server `PLAYER_TIMEOUT`;
  - applica auto-fold/check.

## Riconnessione

- `presence/{playerId}` heartbeat client.
- Scheduled function marca `players[].connected=false` se heartbeat scaduto.
- Alla riconnessione il player riprende da snapshot authoritative (`tables/{tableId}`).
