package com.flamematch.app.poker.repository

object PokerRepositoryProvider {
    val repository: PokerRepository by lazy { FirestorePokerRepository() }
}
