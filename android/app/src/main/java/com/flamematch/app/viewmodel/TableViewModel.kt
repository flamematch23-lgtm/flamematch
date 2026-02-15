package com.flamematch.app.viewmodel

import androidx.lifecycle.ViewModel
import com.flamematch.app.data.TableSummary
import com.flamematch.app.data.WalletAccount
import com.flamematch.app.poker.engine.Action
import com.flamematch.app.poker.engine.AllIn
import com.flamematch.app.poker.engine.Bet
import com.flamematch.app.poker.engine.Call
import com.flamematch.app.poker.engine.Check
import com.flamematch.app.poker.engine.Fold
import com.flamematch.app.poker.engine.HandSetup
import com.flamematch.app.poker.engine.HoldemEngine
import com.flamematch.app.poker.engine.Raise
import com.flamematch.app.poker.engine.TableState
import com.flamematch.app.poker.repository.PokerRepositoryProvider
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

private const val HERO_ID = "demo-user"

data class TableUiState(
    val tableState: TableState? = null,
    val legalActions: Set<String> = emptySet(),
    val errorMessage: String? = null
)

class TableViewModel : ViewModel() {
    private val repository = PokerRepositoryProvider.repository

    val tables: StateFlow<List<TableSummary>> = repository.tables
    val wallet: StateFlow<WalletAccount> = repository.wallet

    private val _uiState = MutableStateFlow(TableUiState())
    val uiState: StateFlow<TableUiState> = _uiState.asStateFlow()

    fun tableById(tableId: String): TableSummary? = tables.value.firstOrNull { it.tableId == tableId }

    fun loadTable(tableId: String) {
        val table = tableById(tableId) ?: return
        if (_uiState.value.tableState?.handId == tableId) return

        val setup = listOf(
            HandSetup(playerId = HERO_ID, seatIndex = 0, stack = wallet.value.chipsOnTable.coerceAtLeast(200).toLong()),
            HandSetup(playerId = "bot-alfa", seatIndex = 1, stack = 1_000),
            HandSetup(playerId = "bot-bravo", seatIndex = 2, stack = 1_000)
        )

        val started = HoldemEngine.startHand(
            handId = table.tableId,
            setup = setup,
            dealerIndex = 0,
            smallBlindAmount = 5,
            bigBlindAmount = 10
        )

        _uiState.value = TableUiState(
            tableState = started,
            legalActions = HoldemEngine.legalActions(started)
        )
    }

    fun perform(action: String) {
        val current = _uiState.value.tableState ?: return
        val pid = current.currentPlayerId ?: return

        val parsed: Action = when (action) {
            "fold" -> Fold(pid)
            "check" -> Check(pid)
            "call" -> Call(pid)
            "bet" -> Bet(pid, amount = current.bigBlindAmount)
            "raise" -> Raise(pid, toAmount = current.currentBet + current.bigBlindAmount)
            else -> AllIn(pid)
        }

        runCatching {
            HoldemEngine.applyAction(current, parsed)
        }.onSuccess { updated ->
            _uiState.value = _uiState.value.copy(
                tableState = updated,
                legalActions = HoldemEngine.legalActions(updated),
                errorMessage = null
            )
        }.onFailure { error ->
            _uiState.value = _uiState.value.copy(errorMessage = error.message)
        }
    }
}
