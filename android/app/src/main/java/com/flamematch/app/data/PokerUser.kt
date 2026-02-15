package com.flamematch.app.data

data class PokerUser(
    val id: String = "",
    val nickname: String = "",
    val totalHands: Int = 0,
    val handsWon: Int = 0,
    val netChips: Int = 0
) {
    val winRate: Double
        get() = if (totalHands == 0) 0.0 else (handsWon.toDouble() / totalHands.toDouble()) * 100.0
}
