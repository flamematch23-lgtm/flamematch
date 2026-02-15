package com.flamematch.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.flamematch.app.data.TableSummary
import com.flamematch.app.poker.engine.TableState
import com.flamematch.app.ui.theme.CardBackground
import com.flamematch.app.ui.theme.DarkBackground

@Composable
fun TableScreen(
    table: TableSummary?,
    chipsOnTable: Int,
    tableState: TableState?,
    legalActions: Set<String>,
    errorMessage: String?,
    onAction: (String) -> Unit,
    onNavigateBack: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(16.dp)
    ) {
        TextButton(onClick = onNavigateBack) { Text("← Lobby") }
        Text("Table - ${table?.stakes ?: "N/A"}", color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Bold)
        Text("${table?.name ?: "Unknown table"}", color = Color.Gray)
        Text("Stack attuale: $chipsOnTable chips", color = Color.Gray)

        Spacer(modifier = Modifier.height(20.dp))

        Card(
            colors = CardDefaults.cardColors(containerColor = CardBackground),
            shape = RoundedCornerShape(18.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text("Round: ${tableState?.bettingRound ?: "-"}", color = Color.LightGray)
                Text("Player to act: ${tableState?.currentPlayerId ?: "-"}", color = Color.LightGray)
                Text("Board", color = Color.LightGray)
                Text(
                    tableState?.communityCards?.joinToString(" ") { "${it.rank.name.first()}${it.suit.name.first()}" }.orEmpty()
                        .ifBlank { "(in attesa del flop)" },
                    color = Color.White,
                    fontSize = 20.sp
                )
                Text("Hole cards", color = Color.LightGray)
                Text(
                    tableState?.players?.firstOrNull { it.playerId == "demo-user" }?.holeCards
                        ?.joinToString(" ") { "${it.rank.name.first()}${it.suit.name.first()}" }
                        .orEmpty(),
                    color = Color.White,
                    fontSize = 20.sp
                )
                if (errorMessage != null) {
                    Text(errorMessage, color = Color.Red)
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            ActionButton("fold", legalActions, onAction)
            ActionButton("check", legalActions, onAction)
            ActionButton("call", legalActions, onAction)
            ActionButton("raise", legalActions, onAction)
            ActionButton("all-in", legalActions, onAction)
        }
    }
}

@Composable
private fun ActionButton(action: String, legalActions: Set<String>, onAction: (String) -> Unit) {
    Button(onClick = { onAction(action) }, enabled = action in legalActions) {
        Text(action.uppercase())
    }
}
