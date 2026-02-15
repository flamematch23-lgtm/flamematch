package com.flamematch.app.poker.repository.dto

import com.flamematch.app.data.HandSummary
import com.flamematch.app.data.LedgerEntry
import com.flamematch.app.data.LedgerType
import com.flamematch.app.data.PokerUser
import com.flamematch.app.data.SeatState
import com.flamematch.app.data.TableSummary
import com.flamematch.app.data.WalletAccount

data class PokerUserDto(
    val nickname: String = "",
    val totalHands: Int = 0,
    val handsWon: Int = 0,
    val netChips: Int = 0
)

data class WalletAccountDto(
    val balance: Int = 0,
    val chipsOnTable: Int = 0,
    val updatedAt: Long = System.currentTimeMillis()
)

data class LedgerEntryDto(
    val type: String = LedgerType.DEPOSIT.name,
    val amount: Int = 0,
    val note: String = "",
    val createdAt: Long = System.currentTimeMillis()
)

data class TableSummaryDto(
    val name: String = "",
    val format: String = "",
    val stakes: String = "",
    val seats: Int = 6,
    val occupiedSeats: Int = 0,
    val seatStates: Map<String, String> = emptyMap()
)

data class HandSummaryDto(
    val tableId: String = "",
    val stake: String = "",
    val deltaChips: Int = 0,
    val result: String = "",
    val playedAt: Long = System.currentTimeMillis()
)

fun PokerUserDto.toDomain(userId: String): PokerUser = PokerUser(
    id = userId,
    nickname = nickname,
    totalHands = totalHands,
    handsWon = handsWon,
    netChips = netChips
)

fun WalletAccountDto.toDomain(userId: String): WalletAccount = WalletAccount(
    userId = userId,
    balance = balance,
    chipsOnTable = chipsOnTable,
    updatedAt = updatedAt
)

fun LedgerEntryDto.toDomain(id: String, userId: String): LedgerEntry = LedgerEntry(
    id = id,
    userId = userId,
    type = runCatching { LedgerType.valueOf(type) }.getOrDefault(LedgerType.DEPOSIT),
    amount = amount,
    note = note,
    createdAt = createdAt
)

fun TableSummaryDto.toDomain(tableId: String): TableSummary = TableSummary(
    tableId = tableId,
    name = name,
    format = format,
    stakes = stakes,
    seats = seats,
    occupiedSeats = occupiedSeats,
    seatStates = seatStates.mapNotNull { (key, value) ->
        key.toIntOrNull()?.let { seat ->
            seat to runCatching { SeatState.valueOf(value) }.getOrDefault(SeatState.EMPTY)
        }
    }.toMap()
)

fun HandSummaryDto.toDomain(handId: String): HandSummary = HandSummary(
    handId = handId,
    tableId = tableId,
    stake = stake,
    deltaChips = deltaChips,
    result = result,
    playedAt = playedAt
)

fun WalletAccount.toDto(): WalletAccountDto = WalletAccountDto(
    balance = balance,
    chipsOnTable = chipsOnTable,
    updatedAt = updatedAt
)
