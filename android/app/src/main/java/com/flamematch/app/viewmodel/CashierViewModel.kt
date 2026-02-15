package com.flamematch.app.viewmodel

import androidx.lifecycle.ViewModel
import com.flamematch.app.data.HandSummary
import com.flamematch.app.data.LedgerEntry
import com.flamematch.app.data.PokerUser
import com.flamematch.app.data.WalletAccount
import com.flamematch.app.poker.repository.PokerRepositoryProvider
import kotlinx.coroutines.flow.StateFlow

class CashierViewModel : ViewModel() {
    private val repository = PokerRepositoryProvider.repository

    val wallet: StateFlow<WalletAccount> = repository.wallet
    val ledger: StateFlow<List<LedgerEntry>> = repository.ledger
    val handHistory: StateFlow<List<HandSummary>> = repository.handHistory
    val userStats: StateFlow<PokerUser> = repository.userStats

    fun deposit(amount: Int) = repository.deposit(amount)
    fun withdraw(amount: Int) = repository.withdraw(amount)
}
