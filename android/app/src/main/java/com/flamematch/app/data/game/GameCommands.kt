package com.flamematch.app.data.game

import com.google.firebase.Timestamp

enum class CommandType {
    JOIN_TABLE,
    POST_BLIND,
    PLAYER_ACTION
}

data class JoinTableIntent(
    val expectedVersion: Long
)

data class PostBlindIntent(
    val expectedVersion: Long,
    val amount: Long,
    val blindType: String,
    val turnToken: String
)

data class PlayerActionIntent(
    val expectedVersion: Long,
    val action: String,
    val amount: Long? = null,
    val turnToken: String
)

data class GameCommand(
    val type: String = "",
    val tableId: String = "",
    val playerId: String = "",
    val clientCommandId: String = "",
    val expectedVersion: Long = 0,
    val payload: Map<String, Any?> = emptyMap(),
    val status: String = "PENDING",
    val result: Map<String, Any?> = emptyMap(),
    val createdAt: Timestamp? = null,
    val appliedAt: Timestamp? = null
)
