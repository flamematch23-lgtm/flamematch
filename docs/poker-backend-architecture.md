# Backend partita realtime (FlameMatch)

## 1) Scelta architetturale: Cloud Functions + Firestore transactions

Per questo progetto è consigliato **Cloud Functions + Firestore** (in alternativa a server WebSocket dedicato) perché:
- riduce overhead operativo (deploy, scalabilità, failover);
- usa transazioni ACID di Firestore per serializzare le azioni;
- permette stream realtime nativo verso Android (snapshot listener);
- semplifica auditing/ripristino tramite event log.

### Quando scegliere WebSocket dedicato
Solo se servono requisiti estremi (latenza ultra-bassa, >10k azioni/s per tavolo, simulazioni multi-hand ad alta frequenza).

---

## 2) Logica sensibile solo server-side

Le seguenti operazioni sono **vietate lato client** e restano in funzioni server (`engine/*`):
- `shuffleDeck(seed)`
- `dealCards(handId)`
- `validateAction(state, action)`
- `applyActionAndAdvanceTurn(state, action)`
- `settlePotAndWinners(state)`

Il client invia solo intenzioni (`joinTable`, `postBlind`, `playerAction`) con idempotency key.

---

## 3) Modello dati con versionamento ottimistico + idempotenza

## Collezioni Firestore

- `tables/{tableId}`: stato corrente del tavolo (read model)
- `tables/{tableId}/hands/{handId}`: snapshot mano
- `tables/{tableId}/events/{eventId}`: event sourcing append-only
- `tables/{tableId}/commands/{commandId}`: comandi client (idempotenti)
- `tables/{tableId}/presence/{playerId}`: heartbeat/reconnect

## Documento `tables/{tableId}`

```json
{
  "tableId": "t_123",
  "status": "WAITING|RUNNING|PAUSED",
  "version": 41,
  "currentHandId": "h_009",
  "turn": {
    "playerId": "u_2",
    "turnToken": "turn_41_u2",
    "decisionDeadlineAt": 1739268000000
  },
  "players": [
    {"playerId": "u_1", "seat": 1, "stack": 1200, "connected": true, "status": "ACTIVE"},
    {"playerId": "u_2", "seat": 2, "stack": 900, "connected": true, "status": "ACTIVE"}
  ],
  "pot": {
    "main": 300,
    "side": []
  },
  "updatedAt": "serverTimestamp"
}
```

## Documento comando (`commands/{commandId}`)

`commandId = <playerId>:<clientCommandId>` per idempotenza forte.

```json
{
  "type": "joinTable|postBlind|playerAction",
  "tableId": "t_123",
  "playerId": "u_2",
  "clientCommandId": "01JXXX...",
  "expectedVersion": 41,
  "payload": {
    "action": "CALL",
    "amount": 100,
    "turnToken": "turn_41_u2"
  },
  "status": "PENDING|APPLIED|REJECTED",
  "result": {"reason": "..."},
  "createdAt": "serverTimestamp",
  "appliedAt": "serverTimestamp"
}
```

## Flusso ottimistico

1. Client legge `table.version = N`.
2. Client invia comando con `expectedVersion = N` e `turnToken`.
3. Cloud Function esegue transazione:
   - rilegge tavolo;
   - valida versione/token/turno;
   - applica logica engine;
   - incrementa `version`;
   - scrive `events/*` e aggiorna `commands/*` a `APPLIED`.
4. In caso mismatch versione -> `REJECTED(CONFLICT)` e client si riallinea via stream.

---

## 4) Android: repository realtime + sole intenzioni

Pattern consigliato:
- `observeTableState(tableId): Flow<TableState>` via snapshot listener;
- `sendIntent(tableId, command)` che crea `commands/{playerId:clientCommandId}`;
- nessuna mutazione diretta di stato mano/tavolo dal client.

Repository implementato in `FirestoreGameRealtimeRepository` con:
- callbackFlow per stream stato;
- helper `joinTable`, `postBlind`, `playerAction`;
- deduplica idempotente server-side tramite command id.

---

## 5) Anti-collisione / concurrency rules

1. **Lock turno**: ogni azione deve includere `turnToken`; token ruota a ogni cambio turno.
2. **Decision timeout**: scheduler server rileva `decisionDeadlineAt` superata e applica auto-fold/check.
3. **Single writer per tavolo**: tutte le mutazioni passano da transazione Cloud Function.
4. **Reconnect player**:
   - client aggiorna `presence/{playerId}.lastSeenAt` ogni 5-10s;
   - server marca `connected=false` oltre soglia;
   - al reconnect il client riceve snapshot completo e riprende dal `version` corrente.
5. **Idempotenza**: stesso `commandId` => stessa risposta/nessun doppio effetto.
6. **Conflict handling**: `expectedVersion` mismatch => reject + retry con stato aggiornato.

---

## Eventi minimi consigliati

- `PLAYER_JOINED`
- `HAND_STARTED`
- `BLIND_POSTED`
- `PLAYER_ACTED`
- `TURN_ADVANCED`
- `HAND_SETTLED`
- `PLAYER_TIMED_OUT`
- `PLAYER_RECONNECTED`

Ogni evento include:
- `eventId`, `tableId`, `handId`, `version`, `serverTs`, `causationCommandId`.

---

## Security posture

- Firestore Rules:
  - client può creare solo `commands/*` con `playerId == request.auth.uid`;
  - client **read-only** su `tables/*`, `hands/*`, `events/*`;
  - deny update/delete su stato partita.
- Cloud Functions con service account scrivono lo stato authoritative.
