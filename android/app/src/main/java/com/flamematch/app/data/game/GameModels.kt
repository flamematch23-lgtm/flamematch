package com.flamematch.app.data.game

import com.google.firebase.Timestamp

data class TableState(
    val tableId: String = "",
    val status: String = "WAITING",
    val version: Long = 0,
    val currentHandId: String? = null,
    val turn: TurnState? = null,
    val players: List<PlayerSeat> = emptyList(),
    val pot: PotState = PotState(),
    val updatedAt: Timestamp? = null
)

data class TurnState(
    val playerId: String = "",
    val turnToken: String = "",
    val decisionDeadlineAtMillis: Long = 0L
)

data class PlayerSeat(
    val playerId: String = "",
    val seat: Int = 0,
    val stack: Long = 0,
    val connected: Boolean = false,
    val status: String = "ACTIVE"
)

data class PotState(
    val main: Long = 0,
    val side: List<Long> = emptyList()
)
