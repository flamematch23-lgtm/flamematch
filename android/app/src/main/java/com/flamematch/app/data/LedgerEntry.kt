package com.flamematch.app.data

enum class LedgerType {
    DEPOSIT,
    WITHDRAW,
    HAND_RESULT
}

data class LedgerEntry(
    val id: String = "",
    val userId: String = "",
    val type: LedgerType = LedgerType.DEPOSIT,
    val amount: Int = 0,
    val note: String = "",
    val createdAt: Long = System.currentTimeMillis()
)
