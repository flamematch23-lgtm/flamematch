package com.flamematch.app.data.game

import kotlinx.coroutines.flow.Flow

interface GameRealtimeRepository {
    fun observeTableState(tableId: String): Flow<TableState>

    suspend fun joinTable(tableId: String, playerId: String, intent: JoinTableIntent): String

    suspend fun postBlind(tableId: String, playerId: String, intent: PostBlindIntent): String

    suspend fun playerAction(tableId: String, playerId: String, intent: PlayerActionIntent): String
}
