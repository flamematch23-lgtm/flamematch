package com.flamematch.app.viewmodel

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel

data class PokerPlayer(
    val nickname: String,
    val bankroll: Int,
    val chipsOnTable: Int
)

class PokerSessionViewModel : ViewModel() {
    var player by mutableStateOf(
        PokerPlayer(
            nickname = "Player_01",
            bankroll = 2_500,
            chipsOnTable = 300
        )
    )
        private set

    var selectedStake by mutableStateOf("€1/€2")
        private set

    fun selectStake(stake: String) {
        selectedStake = stake
    }

    fun deposit(amount: Int) {
        if (amount <= 0 || amount > player.bankroll) return
        player = player.copy(
            bankroll = player.bankroll - amount,
            chipsOnTable = player.chipsOnTable + amount
        )
    }

    fun withdraw(amount: Int) {
        if (amount <= 0 || amount > player.chipsOnTable) return
        player = player.copy(
            bankroll = player.bankroll + amount,
            chipsOnTable = player.chipsOnTable - amount
        )
    }
}
