package com.flamematch.app.data.game

import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import java.util.UUID

class FirestoreGameRealtimeRepository(
    private val db: FirebaseFirestore = FirebaseFirestore.getInstance()
) : GameRealtimeRepository {

    override fun observeTableState(tableId: String): Flow<TableState> = callbackFlow {
        val registration = db.collection(TABLES)
            .document(tableId)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }

                val tableState = snapshot?.toObject(TableState::class.java)
                    ?.copy(tableId = tableId)
                    ?: TableState(tableId = tableId)

                trySend(tableState)
            }

        awaitClose { registration.remove() }
    }

    override suspend fun joinTable(tableId: String, playerId: String, intent: JoinTableIntent): String {
        val commandId = generateCommandId(playerId)
        val command = mapOf(
            "type" to CommandType.JOIN_TABLE.name,
            "tableId" to tableId,
            "playerId" to playerId,
            "clientCommandId" to commandId.substringAfter(":"),
            "expectedVersion" to intent.expectedVersion,
            "payload" to emptyMap<String, Any>(),
            "status" to "PENDING"
        )
        writeCommand(tableId, commandId, command)
        return commandId
    }

    override suspend fun postBlind(tableId: String, playerId: String, intent: PostBlindIntent): String {
        val commandId = generateCommandId(playerId)
        val payload = mapOf(
            "amount" to intent.amount,
            "blindType" to intent.blindType,
            "turnToken" to intent.turnToken
        )
        val command = mapOf(
            "type" to CommandType.POST_BLIND.name,
            "tableId" to tableId,
            "playerId" to playerId,
            "clientCommandId" to commandId.substringAfter(":"),
            "expectedVersion" to intent.expectedVersion,
            "payload" to payload,
            "status" to "PENDING"
        )
        writeCommand(tableId, commandId, command)
        return commandId
    }

    override suspend fun playerAction(tableId: String, playerId: String, intent: PlayerActionIntent): String {
        val commandId = generateCommandId(playerId)
        val payload = mapOf(
            "action" to intent.action,
            "amount" to intent.amount,
            "turnToken" to intent.turnToken
        )
        val command = mapOf(
            "type" to CommandType.PLAYER_ACTION.name,
            "tableId" to tableId,
            "playerId" to playerId,
            "clientCommandId" to commandId.substringAfter(":"),
            "expectedVersion" to intent.expectedVersion,
            "payload" to payload,
            "status" to "PENDING"
        )
        writeCommand(tableId, commandId, command)
        return commandId
    }

    private fun writeCommand(tableId: String, commandId: String, command: Map<String, Any?>) {
        db.collection(TABLES)
            .document(tableId)
            .collection(COMMANDS)
            .document(commandId)
            .set(command)
    }

    private fun generateCommandId(playerId: String): String = "$playerId:${UUID.randomUUID()}"

    private companion object {
        const val TABLES = "tables"
        const val COMMANDS = "commands"
    }
}
