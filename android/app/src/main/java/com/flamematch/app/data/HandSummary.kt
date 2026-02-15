package com.flamematch.app.data

data class HandSummary(
    val handId: String = "",
    val tableId: String = "",
    val stake: String = "",
    val deltaChips: Int = 0,
    val result: String = "",
    val playedAt: Long = System.currentTimeMillis()
)
