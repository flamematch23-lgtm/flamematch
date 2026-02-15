package com.flamematch.app.viewmodel

import androidx.lifecycle.ViewModel
import com.flamematch.app.data.TableSummary
import com.flamematch.app.poker.repository.PokerRepositoryProvider
import kotlinx.coroutines.flow.StateFlow

class LobbyViewModel : ViewModel() {
    private val repository = PokerRepositoryProvider.repository
    val tables: StateFlow<List<TableSummary>> = repository.tables

    var selectedStake: String = "€1/€2"
        private set

    init {
        repository.start(userId = "demo-user")
    }

    fun selectStake(stake: String) {
        selectedStake = stake
        repository.selectStake(stake)
    }
}
