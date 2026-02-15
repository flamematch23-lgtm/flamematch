package com.flamematch.app.poker.engine

import kotlin.random.Random

enum class Suit {
    CLUBS, DIAMONDS, HEARTS, SPADES
}

enum class Rank(val value: Int) {
    TWO(2),
    THREE(3),
    FOUR(4),
    FIVE(5),
    SIX(6),
    SEVEN(7),
    EIGHT(8),
    NINE(9),
    TEN(10),
    JACK(11),
    QUEEN(12),
    KING(13),
    ACE(14)
}

data class Card(
    val rank: Rank,
    val suit: Suit
)

data class Deck(
    val cards: List<Card>
) {
    fun draw(count: Int = 1): DrawResult {
        require(count >= 0) { "count must be >= 0" }
        require(count <= cards.size) { "Cannot draw $count cards from deck of ${cards.size}" }
        return DrawResult(
            drawn = cards.take(count),
            deck = copy(cards = cards.drop(count))
        )
    }

    companion object {
        fun standardShuffled(random: Random = Random.Default): Deck {
            val allCards = Suit.entries.flatMap { suit ->
                Rank.entries.map { rank -> Card(rank = rank, suit = suit) }
            }
            return Deck(cards = allCards.shuffled(random))
        }
    }
}

data class DrawResult(
    val drawn: List<Card>,
    val deck: Deck
)

enum class BettingRound {
    PRE_FLOP,
    FLOP,
    TURN,
    RIVER,
    SHOWDOWN,
    COMPLETE
}

enum class HandStatus {
    IN_PROGRESS,
    SHOWDOWN,
    COMPLETE
}

data class Pot(
    val amount: Long,
    val eligiblePlayerIds: Set<String>
)

data class PlayerState(
    val playerId: String,
    val seatIndex: Int,
    val stack: Long,
    val holeCards: List<Card> = emptyList(),
    val folded: Boolean = false,
    val allIn: Boolean = false,
    val totalCommitted: Long = 0,
    val streetCommitted: Long = 0,
    val actedThisStreet: Boolean = false
)

data class HandSetup(
    val playerId: String,
    val seatIndex: Int,
    val stack: Long
)

data class TableState(
    val handId: String,
    val players: List<PlayerState>,
    val deck: Deck,
    val communityCards: List<Card> = emptyList(),
    val bettingRound: BettingRound = BettingRound.PRE_FLOP,
    val handStatus: HandStatus = HandStatus.IN_PROGRESS,
    val dealerIndex: Int,
    val smallBlindIndex: Int,
    val bigBlindIndex: Int,
    val smallBlindAmount: Long,
    val bigBlindAmount: Long,
    val currentBet: Long,
    val minRaiseTo: Long,
    val currentPlayerId: String?,
    val pots: List<Pot> = emptyList(),
    val actionHistory: List<Action> = emptyList(),
    val winnings: Map<String, Long> = emptyMap(),
    val showdownHands: Map<String, HandValue> = emptyMap()
)

sealed interface Action {
    val playerId: String
}

data class Fold(override val playerId: String) : Action

data class Check(override val playerId: String) : Action

data class Call(override val playerId: String) : Action

data class Bet(
    override val playerId: String,
    val amount: Long
) : Action

data class Raise(
    override val playerId: String,
    val toAmount: Long
) : Action

data class AllIn(override val playerId: String) : Action
