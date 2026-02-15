package com.flamematch.app.poker.engine

data class HandValue(
    val category: Int,
    val tiebreak: List<Int>
) : Comparable<HandValue> {
    override fun compareTo(other: HandValue): Int {
        if (category != other.category) return category.compareTo(other.category)
        val max = maxOf(tiebreak.size, other.tiebreak.size)
        for (i in 0 until max) {
            val left = tiebreak.getOrElse(i) { -1 }
            val right = other.tiebreak.getOrElse(i) { -1 }
            if (left != right) return left.compareTo(right)
        }
        return 0
    }
}

object HoldemHandEvaluator {
    fun evaluate(cards: List<Card>): HandValue {
        require(cards.size >= 5) { "At least 5 cards are required" }
        var best: HandValue? = null
        for (a in 0 until cards.size - 4) {
            for (b in a + 1 until cards.size - 3) {
                for (c in b + 1 until cards.size - 2) {
                    for (d in c + 1 until cards.size - 1) {
                        for (e in d + 1 until cards.size) {
                            val value = evaluateFive(listOf(cards[a], cards[b], cards[c], cards[d], cards[e]))
                            if (best == null || value > best) {
                                best = value
                            }
                        }
                    }
                }
            }
        }
        return requireNotNull(best)
    }

    private fun evaluateFive(cards: List<Card>): HandValue {
        val ranksDesc = cards.map { it.rank.value }.sortedDescending()
        val countsByRank = cards.groupingBy { it.rank.value }.eachCount()
        val rankGroups = countsByRank.entries
            .sortedWith(compareByDescending<Map.Entry<Int, Int>> { it.value }.thenByDescending { it.key })

        val isFlush = cards.map { it.suit }.toSet().size == 1
        val straightHigh = straightHighCard(cards.map { it.rank.value })

        if (isFlush && straightHigh != null) {
            return HandValue(category = 8, tiebreak = listOf(straightHigh))
        }

        if (rankGroups[0].value == 4) {
            val four = rankGroups[0].key
            val kicker = rankGroups[1].key
            return HandValue(category = 7, tiebreak = listOf(four, kicker))
        }

        if (rankGroups[0].value == 3 && rankGroups[1].value == 2) {
            return HandValue(category = 6, tiebreak = listOf(rankGroups[0].key, rankGroups[1].key))
        }

        if (isFlush) {
            return HandValue(category = 5, tiebreak = ranksDesc)
        }

        if (straightHigh != null) {
            return HandValue(category = 4, tiebreak = listOf(straightHigh))
        }

        if (rankGroups[0].value == 3) {
            val trips = rankGroups[0].key
            val kickers = rankGroups.drop(1).map { it.key }.sortedDescending()
            return HandValue(category = 3, tiebreak = listOf(trips) + kickers)
        }

        if (rankGroups[0].value == 2 && rankGroups[1].value == 2) {
            val topPair = maxOf(rankGroups[0].key, rankGroups[1].key)
            val secondPair = minOf(rankGroups[0].key, rankGroups[1].key)
            val kicker = rankGroups.first { it.value == 1 }.key
            return HandValue(category = 2, tiebreak = listOf(topPair, secondPair, kicker))
        }

        if (rankGroups[0].value == 2) {
            val pair = rankGroups[0].key
            val kickers = rankGroups.drop(1).map { it.key }.sortedDescending()
            return HandValue(category = 1, tiebreak = listOf(pair) + kickers)
        }

        return HandValue(category = 0, tiebreak = ranksDesc)
    }

    private fun straightHighCard(ranks: List<Int>): Int? {
        val unique = ranks.toSet().toMutableSet()
        if (14 in unique) unique.add(1)
        val sorted = unique.sorted()
        var run = 1
        var best: Int? = null
        for (i in 1 until sorted.size) {
            if (sorted[i] == sorted[i - 1] + 1) {
                run++
                if (run >= 5) {
                    best = sorted[i]
                }
            } else {
                run = 1
            }
        }
        return when (best) {
            1 -> 5
            else -> best
        }
    }
}
