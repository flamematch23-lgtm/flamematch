package com.flamematch.app.data

data class User(
    val id: String = "",
    val name: String = "",
    val email: String = "",
    val age: Int = 0,
    val bio: String = "",
    val photoUrl: String = "",
    val isPremium: Boolean = false,
    val points: Int = 0
)
