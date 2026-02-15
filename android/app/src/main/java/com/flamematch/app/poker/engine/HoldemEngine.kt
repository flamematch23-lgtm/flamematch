package com.flamematch.app.poker.engine

object HoldemEngine {

    fun startHand(
        handId: String,
        setup: List<HandSetup>,
        dealerIndex: Int,
        smallBlindAmount: Long,
        bigBlindAmount: Long,
        deck: Deck = Deck.standardShuffled()
    ): TableState {
        require(setup.size >= 2) { "At least 2 players are required" }
        require(bigBlindAmount >= smallBlindAmount) { "Big blind must be >= small blind" }

        val ordered = setup.sortedBy { it.seatIndex }
        val dealerPos = normalizeIndex(dealerIndex, ordered.size)
        val sbPos = smallBlindPosition(ordered.size, dealerPos)
        val bbPos = bigBlindPosition(ordered.size, dealerPos)

        var currentDeck = deck
        var players = ordered.map { PlayerState(it.playerId, it.seatIndex, it.stack) }

        players = players.map {
            val draw = currentDeck.draw(2)
            currentDeck = draw.deck
            it.copy(holeCards = draw.drawn)
        }

        players = postBlind(players, sbPos, smallBlindAmount)
        players = postBlind(players, bbPos, bigBlindAmount)

        val firstActor = firstToActPreFlop(players, bbPos, dealerPos)

        return TableState(
            handId = handId,
            players = players,
            deck = currentDeck,
            dealerIndex = dealerPos,
            smallBlindIndex = sbPos,
            bigBlindIndex = bbPos,
            smallBlindAmount = smallBlindAmount,
            bigBlindAmount = bigBlindAmount,
            currentBet = players[bbPos].streetCommitted,
            minRaiseTo = players[bbPos].streetCommitted + bigBlindAmount,
            currentPlayerId = players[firstActor].playerId
        )
    }

    fun applyAction(state: TableState, action: Action): TableState {
        require(state.handStatus == HandStatus.IN_PROGRESS) { "Hand is not in progress" }
        require(state.currentPlayerId == action.playerId) { "It's not ${action.playerId}'s turn" }

        val playerIndex = state.players.indexOfFirst { it.playerId == action.playerId }
        require(playerIndex >= 0) { "Unknown player ${action.playerId}" }

        val player = state.players[playerIndex]
        require(!player.folded) { "Folded player cannot act" }
        require(!player.allIn) { "All-in player cannot act" }

        val toCall = (state.currentBet - player.streetCommitted).coerceAtLeast(0)

        val (updatedPlayers, newCurrentBet, newMinRaiseTo) = when (action) {
            is Fold -> Triple(markActed(state.players, playerIndex).mapAt(playerIndex) {
                it.copy(folded = true)
            }, state.currentBet, state.minRaiseTo)

            is Check -> {
                require(toCall == 0L) { "Cannot check facing a bet" }
                Triple(markActed(state.players, playerIndex), state.currentBet, state.minRaiseTo)
            }

            is Call -> {
                require(toCall > 0) { "Nothing to call" }
                val commit = minOf(player.stack, toCall)
                val players = applyCommit(state.players, playerIndex, commit)
                Triple(players, maxOf(state.currentBet, players[playerIndex].streetCommitted), state.minRaiseTo)
            }

            is Bet -> {
                require(toCall == 0L) { "Use raise when facing a bet" }
                require(action.amount > 0) { "Bet amount must be > 0" }
                require(action.amount <= player.stack) { "Insufficient stack" }
                val minBet = state.bigBlindAmount
                require(action.amount >= minBet || action.amount == player.stack) { "Bet must be >= big blind or all-in" }

                val players = applyCommit(state.players, playerIndex, action.amount)
                val newBet = players[playerIndex].streetCommitted
                Triple(players, newBet, newBet + minBet)
            }

            is Raise -> {
                require(toCall > 0) { "Use bet when no outstanding bet" }
                require(action.toAmount > state.currentBet) { "Raise must increase current bet" }
                val add = action.toAmount - player.streetCommitted
                require(add > 0) { "Raise amount must be positive" }
                require(add <= player.stack) { "Insufficient stack" }
                val isAllIn = add == player.stack
                require(action.toAmount >= state.minRaiseTo || isAllIn) { "Raise must be at least min raise unless all-in" }

                val players = applyCommit(state.players, playerIndex, add)
                val appliedTo = players[playerIndex].streetCommitted
                val raiseDelta = appliedTo - state.currentBet
                val nextMinRaiseTo = if (raiseDelta > 0 && (action.toAmount >= state.minRaiseTo)) {
                    appliedTo + raiseDelta
                } else {
                    state.minRaiseTo
                }
                Triple(players, maxOf(state.currentBet, appliedTo), nextMinRaiseTo)
            }

            is AllIn -> {
                require(player.stack > 0) { "No chips to go all-in" }
                val add = player.stack
                val players = applyCommit(state.players, playerIndex, add)
                val appliedTo = players[playerIndex].streetCommitted

                if (appliedTo > state.currentBet) {
                    val raiseDelta = appliedTo - state.currentBet
                    val nextMinRaiseTo = if (raiseDelta >= (state.minRaiseTo - state.currentBet)) {
                        appliedTo + raiseDelta
                    } else {
                        state.minRaiseTo
                    }
                    Triple(players, appliedTo, nextMinRaiseTo)
                } else {
                    Triple(players, state.currentBet, state.minRaiseTo)
                }
            }
        }

        var next = state.copy(
            players = updatedPlayers,
            currentBet = newCurrentBet,
            minRaiseTo = newMinRaiseTo,
            actionHistory = state.actionHistory + action
        )

        if (next.players.count { !it.folded } == 1) {
            return settleWithoutShowdown(next)
        }

        if (isBettingRoundComplete(next)) {
            next = advanceRound(next)
        } else {
            next = next.copy(currentPlayerId = nextPlayerToAct(next, playerIndex)?.playerId)
        }

        if (next.handStatus == HandStatus.IN_PROGRESS && everyoneAllInOrFolded(next)) {
            next = runoutAndShowdown(next)
        }

        return next
    }

    fun legalActions(state: TableState): Set<String> {
        val playerId = state.currentPlayerId ?: return emptySet()
        val player = state.players.firstOrNull { it.playerId == playerId } ?: return emptySet()
        if (player.folded || player.allIn || state.handStatus != HandStatus.IN_PROGRESS) return emptySet()

        val toCall = (state.currentBet - player.streetCommitted).coerceAtLeast(0)
        return if (toCall == 0L) {
            buildSet {
                add("check")
                if (player.stack > 0) add("bet")
                add("all-in")
                add("fold")
            }
        } else {
            buildSet {
                add("fold")
                if (player.stack >= toCall) add("call") else add("all-in")
                if (player.stack > toCall) add("raise")
                add("all-in")
            }
        }
    }

    private fun settleWithoutShowdown(state: TableState): TableState {
        val winner = state.players.first { !it.folded }
        val totalPot = state.players.sumOf { it.totalCommitted }

        val players = state.players.map {
            if (it.playerId == winner.playerId) it.copy(stack = it.stack + totalPot) else it
        }

        return state.copy(
            players = players,
            currentPlayerId = null,
            bettingRound = BettingRound.COMPLETE,
            handStatus = HandStatus.COMPLETE,
            pots = listOf(Pot(amount = totalPot, eligiblePlayerIds = setOf(winner.playerId))),
            winnings = mapOf(winner.playerId to totalPot)
        )
    }

    private fun runoutAndShowdown(state: TableState): TableState {
        var next = state
        while (next.communityCards.size < 5) {
            val drawCount = when (next.communityCards.size) {
                0 -> 3
                3, 4 -> 1
                else -> 0
            }
            val draw = next.deck.draw(drawCount)
            next = next.copy(
                communityCards = next.communityCards + draw.drawn,
                deck = draw.deck
            )
        }
        return showdown(next)
    }

    private fun showdown(state: TableState): TableState {
        val pots = buildSidePots(state.players)
        val rankings = state.players
            .filter { !it.folded }
            .associate { it.playerId to HoldemHandEvaluator.evaluate(it.holeCards + state.communityCards) }

        val mutableStacks = state.players.associate { it.playerId to it.stack }.toMutableMap()
        val winnings = mutableMapOf<String, Long>()

        for (pot in pots) {
            val eligible = pot.eligiblePlayerIds.filter { it in rankings.keys }
            if (eligible.isEmpty()) continue

            val best = eligible.maxOf { rankings.getValue(it) }
            val winners = eligible.filter { rankings.getValue(it) == best }
            val split = pot.amount / winners.size
            val remainder = pot.amount % winners.size

            val orderedWinners = winners.sortedBy { pid ->
                seatDistanceFromDealer(state.players.first { it.playerId == pid }.seatIndex, state)
            }

            orderedWinners.forEachIndexed { index, pid ->
                val amount = split + if (index < remainder) 1 else 0
                mutableStacks[pid] = mutableStacks.getValue(pid) + amount
                winnings[pid] = winnings.getOrDefault(pid, 0) + amount
            }
        }

        val players = state.players.map { player ->
            player.copy(stack = mutableStacks.getValue(player.playerId))
        }

        return state.copy(
            players = players,
            pots = pots,
            showdownHands = rankings,
            winnings = winnings,
            currentPlayerId = null,
            bettingRound = BettingRound.COMPLETE,
            handStatus = HandStatus.COMPLETE
        )
    }

    private fun buildSidePots(players: List<PlayerState>): List<Pot> {
        val levels = players.map { it.totalCommitted }.filter { it > 0 }.distinct().sorted()
        if (levels.isEmpty()) return emptyList()

        val pots = mutableListOf<Pot>()
        var previous = 0L
        for (level in levels) {
            val contributors = players.filter { it.totalCommitted >= level }
            val increment = level - previous
            val amount = increment * contributors.size
            if (amount > 0) {
                val eligible = contributors.filter { !it.folded }.map { it.playerId }.toSet()
                pots += Pot(amount = amount, eligiblePlayerIds = eligible)
            }
            previous = level
        }
        return pots
    }

    private fun advanceRound(state: TableState): TableState {
        val remaining = state.players.filter { !it.folded }
        if (remaining.size <= 1) return settleWithoutShowdown(state)

        val nextRound = when (state.bettingRound) {
            BettingRound.PRE_FLOP -> BettingRound.FLOP
            BettingRound.FLOP -> BettingRound.TURN
            BettingRound.TURN -> BettingRound.RIVER
            BettingRound.RIVER,
            BettingRound.SHOWDOWN,
            BettingRound.COMPLETE -> BettingRound.SHOWDOWN
        }

        if (nextRound == BettingRound.SHOWDOWN) {
            return showdown(state.copy(bettingRound = BettingRound.SHOWDOWN, handStatus = HandStatus.SHOWDOWN))
        }

        val drawCount = when (nextRound) {
            BettingRound.FLOP -> 3
            BettingRound.TURN, BettingRound.RIVER -> 1
            else -> 0
        }

        val draw = state.deck.draw(drawCount)
        val playersReset = state.players.map { it.copy(streetCommitted = 0, actedThisStreet = false) }
        val firstToAct = firstToActPostFlop(playersReset, state.dealerIndex)

        return state.copy(
            players = playersReset,
            deck = draw.deck,
            communityCards = state.communityCards + draw.drawn,
            bettingRound = nextRound,
            currentBet = 0,
            minRaiseTo = state.bigBlindAmount,
            currentPlayerId = firstToAct?.playerId
        )
    }

    private fun isBettingRoundComplete(state: TableState): Boolean {
        val active = state.players.filter { !it.folded }
        val nonAllIn = active.filter { !it.allIn }
        if (nonAllIn.isEmpty()) return true

        val target = nonAllIn.maxOf { it.streetCommitted }
        return nonAllIn.all { it.actedThisStreet && it.streetCommitted == target }
    }

    private fun everyoneAllInOrFolded(state: TableState): Boolean {
        val contenders = state.players.filter { !it.folded }
        return contenders.all { it.allIn }
    }

    private fun firstToActPreFlop(players: List<PlayerState>, bbPos: Int, dealerPos: Int): Int {
        return if (players.size == 2) {
            dealerPos
        } else {
            nextActiveIndex(players, bbPos)
        }
    }

    private fun firstToActPostFlop(players: List<PlayerState>, dealerPos: Int): PlayerState? {
        val start = nextActiveIndex(players, dealerPos)
        return players.getOrNull(start)
    }

    private fun nextPlayerToAct(state: TableState, fromIndex: Int): PlayerState? {
        if (state.players.isEmpty()) return null
        var idx = fromIndex
        repeat(state.players.size) {
            idx = (idx + 1) % state.players.size
            val p = state.players[idx]
            if (!p.folded && !p.allIn) return p
        }
        return null
    }

    private fun nextActiveIndex(players: List<PlayerState>, fromIndex: Int): Int {
        var idx = fromIndex
        repeat(players.size) {
            idx = (idx + 1) % players.size
            val p = players[idx]
            if (!p.folded && p.stack + p.streetCommitted > 0) return idx
        }
        return fromIndex
    }

    private fun postBlind(players: List<PlayerState>, index: Int, amount: Long): List<PlayerState> {
        if (players.isEmpty()) return players
        val blind = minOf(amount, players[index].stack)
        return applyCommit(players, index, blind)
    }

    private fun applyCommit(players: List<PlayerState>, playerIndex: Int, add: Long): List<PlayerState> {
        if (add == 0L) return markActed(players, playerIndex)
        return players.mapIndexed { idx, player ->
            if (idx != playerIndex) {
                player
            } else {
                val newStack = player.stack - add
                val newStreet = player.streetCommitted + add
                val newTotal = player.totalCommitted + add
                player.copy(
                    stack = newStack,
                    streetCommitted = newStreet,
                    totalCommitted = newTotal,
                    actedThisStreet = true,
                    allIn = newStack == 0L
                )
            }
        }
    }

    private fun markActed(players: List<PlayerState>, playerIndex: Int): List<PlayerState> {
        return players.mapIndexed { idx, player ->
            if (idx != playerIndex) player else player.copy(actedThisStreet = true)
        }
    }

    private fun smallBlindPosition(size: Int, dealerPos: Int): Int {
        return if (size == 2) dealerPos else (dealerPos + 1) % size
    }

    private fun bigBlindPosition(size: Int, dealerPos: Int): Int {
        return if (size == 2) (dealerPos + 1) % size else (dealerPos + 2) % size
    }

    private fun normalizeIndex(index: Int, size: Int): Int {
        require(size > 0) { "size must be > 0" }
        val normalized = index % size
        return if (normalized >= 0) normalized else normalized + size
    }

    private fun seatDistanceFromDealer(seatIndex: Int, state: TableState): Int {
        val seats = state.players.map { it.seatIndex }.sorted()
        val dealerSeat = state.players[state.dealerIndex].seatIndex
        val dealerPos = seats.indexOf(dealerSeat)
        val seatPos = seats.indexOf(seatIndex)
        return if (seatPos >= dealerPos) seatPos - dealerPos else seats.size - dealerPos + seatPos
    }
}

private inline fun <T> List<T>.mapAt(index: Int, transform: (T) -> T): List<T> {
    return mapIndexed { idx, value -> if (idx == index) transform(value) else value }
}
