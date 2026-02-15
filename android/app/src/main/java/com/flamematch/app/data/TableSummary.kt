package com.flamematch.app.data

data class TableSummary(
    val tableId: String = "",
    val name: String = "",
    val format: String = "",
    val stakes: String = "",
    val seats: Int = 6,
    val occupiedSeats: Int = 0,
    val seatStates: Map<Int, SeatState> = emptyMap()
)
