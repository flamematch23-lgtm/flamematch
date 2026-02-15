package com.flamematch.app.data

data class WalletAccount(
    val userId: String = "",
    val balance: Int = 0,
    val chipsOnTable: Int = 0,
    val updatedAt: Long = System.currentTimeMillis()
)
