package com.flamematch.app.poker.repository

import com.flamematch.app.data.HandSummary
import com.flamematch.app.data.LedgerEntry
import com.flamematch.app.data.PokerUser
import com.flamematch.app.data.TableSummary
import com.flamematch.app.data.WalletAccount
import kotlinx.coroutines.flow.StateFlow

sealed class SyncStatus {
    data object Connected : SyncStatus()
    data class Reconnecting(val attempt: Int) : SyncStatus()
    data class Error(val message: String) : SyncStatus()
}

interface PokerRepository {
    val syncStatus: StateFlow<SyncStatus>
    val tables: StateFlow<List<TableSummary>>
    val wallet: StateFlow<WalletAccount>
    val ledger: StateFlow<List<LedgerEntry>>
    val handHistory: StateFlow<List<HandSummary>>
    val userStats: StateFlow<PokerUser>

    fun start(userId: String)
    fun selectStake(stake: String)
    fun deposit(amount: Int)
    fun withdraw(amount: Int)
    fun stop()
}
