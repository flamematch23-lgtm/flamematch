package com.flamematch.app.poker.repository

import com.flamematch.app.data.HandSummary
import com.flamematch.app.data.LedgerEntry
import com.flamematch.app.data.LedgerType
import com.flamematch.app.data.PokerUser
import com.flamematch.app.data.TableSummary
import com.flamematch.app.data.WalletAccount
import com.flamematch.app.poker.repository.dto.HandSummaryDto
import com.flamematch.app.poker.repository.dto.LedgerEntryDto
import com.flamematch.app.poker.repository.dto.PokerUserDto
import com.flamematch.app.poker.repository.dto.TableSummaryDto
import com.flamematch.app.poker.repository.dto.WalletAccountDto
import com.flamematch.app.poker.repository.dto.toDomain
import com.flamematch.app.poker.repository.dto.toDto
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class FirestorePokerRepository(
    private val db: FirebaseFirestore = FirebaseFirestore.getInstance()
) : PokerRepository {
    private val scope = CoroutineScope(Dispatchers.IO + Job())
    private var userId: String = ""

    private val _syncStatus = MutableStateFlow<SyncStatus>(SyncStatus.Connected)
    override val syncStatus: StateFlow<SyncStatus> = _syncStatus

    private val _tables = MutableStateFlow(seedTables())
    override val tables: StateFlow<List<TableSummary>> = _tables

    private val _wallet = MutableStateFlow(WalletAccount())
    override val wallet: StateFlow<WalletAccount> = _wallet

    private val _ledger = MutableStateFlow<List<LedgerEntry>>(emptyList())
    override val ledger: StateFlow<List<LedgerEntry>> = _ledger

    private val _handHistory = MutableStateFlow<List<HandSummary>>(seedHands())
    override val handHistory: StateFlow<List<HandSummary>> = _handHistory

    private val _userStats = MutableStateFlow(PokerUser(nickname = "Player_01", totalHands = 3, handsWon = 2, netChips = 340))
    override val userStats: StateFlow<PokerUser> = _userStats

    private val listeners = mutableListOf<ListenerRegistration>()

    override fun start(userId: String) {
        this.userId = userId
        attachTableListener()
        attachWalletListenerWithRetry()
        attachLedgerListener()
    }

    override fun selectStake(stake: String) {
        _tables.value = _tables.value.sortedByDescending { if (it.stakes == stake) 1 else 0 }
    }

    override fun deposit(amount: Int) {
        if (amount <= 0 || amount > _wallet.value.balance) return
        val newWallet = _wallet.value.copy(
            balance = _wallet.value.balance - amount,
            chipsOnTable = _wallet.value.chipsOnTable + amount,
            updatedAt = System.currentTimeMillis()
        )
        _wallet.value = newWallet
        saveWallet(newWallet)
        appendLedger(LedgerType.DEPOSIT, amount, "Deposit to table")
    }

    override fun withdraw(amount: Int) {
        if (amount <= 0 || amount > _wallet.value.chipsOnTable) return
        val newWallet = _wallet.value.copy(
            balance = _wallet.value.balance + amount,
            chipsOnTable = _wallet.value.chipsOnTable - amount,
            updatedAt = System.currentTimeMillis()
        )
        _wallet.value = newWallet
        saveWallet(newWallet)
        appendLedger(LedgerType.WITHDRAW, amount, "Withdraw from table")
    }

    override fun stop() {
        listeners.forEach { it.remove() }
        listeners.clear()
    }

    private fun attachTableListener() {
        val registration = db.collection("poker_tables").addSnapshotListener { snap, error ->
            if (error != null) {
                _syncStatus.value = SyncStatus.Error(error.message ?: "table sync error")
                return@addSnapshotListener
            }
            val rows = snap?.documents?.map { it.toObject(TableSummaryDto::class.java)?.toDomain(it.id) }?.filterNotNull()
            if (!rows.isNullOrEmpty()) {
                _tables.value = rows
            }
        }
        listeners += registration
    }

    private fun attachWalletListenerWithRetry() {
        if (userId.isBlank()) return
        fun listen(attempt: Int) {
            val registration = db.collection("wallets").document(userId).addSnapshotListener { snap, error ->
                if (error != null) {
                    scope.launch {
                        val next = attempt + 1
                        _syncStatus.value = SyncStatus.Reconnecting(next)
                        delay((next * 1_000L).coerceAtMost(5_000L))
                        listen(next)
                    }
                    return@addSnapshotListener
                }
                val dto = snap?.toObject(WalletAccountDto::class.java)
                if (dto != null) {
                    _wallet.value = dto.toDomain(userId)
                    _syncStatus.value = SyncStatus.Connected
                } else if (_wallet.value.userId.isBlank()) {
                    _wallet.value = WalletAccount(userId = userId, balance = 2_500, chipsOnTable = 300)
                    saveWallet(_wallet.value)
                }
            }
            listeners += registration
        }
        listen(attempt = 0)
    }

    private fun attachLedgerListener() {
        if (userId.isBlank()) return
        val registration = db.collection("wallets").document(userId).collection("ledger")
            .addSnapshotListener { snap, error ->
                if (error != null) {
                    _syncStatus.value = SyncStatus.Error(error.message ?: "ledger sync error")
                    return@addSnapshotListener
                }
                val items = snap?.documents?.map { it.toObject(LedgerEntryDto::class.java)?.toDomain(it.id, userId) }
                    ?.filterNotNull()
                    ?.sortedByDescending { it.createdAt }
                    .orEmpty()
                if (items.isNotEmpty()) {
                    _ledger.value = items
                }
            }
        listeners += registration
    }

    private fun saveWallet(wallet: WalletAccount) {
        if (userId.isBlank()) return
        db.collection("wallets").document(userId).set(wallet.toDto())
    }

    private fun appendLedger(type: LedgerType, amount: Int, note: String) {
        if (userId.isBlank()) return
        val entry = LedgerEntry(
            id = "local-${System.currentTimeMillis()}",
            userId = userId,
            type = type,
            amount = amount,
            note = note,
            createdAt = System.currentTimeMillis()
        )
        _ledger.value = listOf(entry) + _ledger.value
        db.collection("wallets").document(userId).collection("ledger")
            .add(LedgerEntryDto(type = type.name, amount = amount, note = note, createdAt = entry.createdAt))
    }

    private fun seedTables(): List<TableSummary> = listOf(
        TableSummary("t1", "Torino Turbo", "6-Max NLH", "€1/€2", occupiedSeats = 4),
        TableSummary("t2", "Milano Deep", "9-Max NLH", "€2/€5", seats = 9, occupiedSeats = 7),
        TableSummary("t3", "Roma Sprint", "HU SNG", "€0.5/€1", seats = 2, occupiedSeats = 1)
    )

    private fun seedHands(): List<HandSummary> = listOf(
        HandSummary("10234", "t1", "€1/€2", +120, "Won at showdown"),
        HandSummary("10233", "t1", "€1/€2", -40, "Folded turn"),
        HandSummary("10232", "t2", "€2/€5", +260, "River value bet")
    )
}
