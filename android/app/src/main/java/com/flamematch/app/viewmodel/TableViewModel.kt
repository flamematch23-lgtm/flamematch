package com.flamematch.app.viewmodel

import androidx.lifecycle.ViewModel
import com.flamematch.app.data.TableSummary
import com.flamematch.app.data.WalletAccount
import com.flamematch.app.poker.repository.PokerRepositoryProvider
import kotlinx.coroutines.flow.StateFlow

class TableViewModel : ViewModel() {
    private val repository = PokerRepositoryProvider.repository

    val tables: StateFlow<List<TableSummary>> = repository.tables
    val wallet: StateFlow<WalletAccount> = repository.wallet

    fun tableById(tableId: String): TableSummary? = tables.value.firstOrNull { it.tableId == tableId }
}
