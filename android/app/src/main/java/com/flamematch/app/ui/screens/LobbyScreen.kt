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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.flamematch.app.data.TableSummary
import com.flamematch.app.ui.theme.CardBackground
import com.flamematch.app.ui.theme.DarkBackground

@Composable
fun LobbyScreen(
    selectedStake: String,
    tables: List<TableSummary>,
    onSelectStake: (String) -> Unit,
    onNavigateToTable: (TableSummary) -> Unit,
    onNavigateToCashier: () -> Unit,
    onNavigateToHistory: () -> Unit,
    onNavigateToProfile: () -> Unit
) {
    val stakes = listOf("€0.5/€1", "€1/€2", "€2/€5")
    val filtered = tables.filter { it.stakes == selectedStake }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(16.dp)
    ) {
        Text("Poker Lobby", style = MaterialTheme.typography.headlineSmall, color = Color.White)
        Text("Seleziona stake e formato del tavolo", color = Color.Gray)
        Spacer(modifier = Modifier.height(12.dp))

        Row {
            stakes.forEach { stake ->
                FilterChip(selected = selectedStake == stake, onClick = { onSelectStake(stake) }, label = { Text(stake) })
                Spacer(modifier = Modifier.width(8.dp))
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.weight(1f)) {
            items(filtered) { table ->
                Card(
                    colors = CardDefaults.cardColors(containerColor = CardBackground),
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(Modifier.padding(14.dp)) {
                        Text(table.name, color = Color.White, fontWeight = FontWeight.Bold)
                        Text("${table.format} • ${table.stakes}", color = Color.LightGray)
                        Text("Posti: ${table.occupiedSeats}/${table.seats}", color = Color.Gray)
                        Spacer(modifier = Modifier.height(8.dp))
                        Button(onClick = { onNavigateToTable(table) }) { Text("Apri Tavolo") }
                    }
                }
            }
        }

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Button(onClick = onNavigateToHistory) { Text("Hand History") }
            Button(onClick = onNavigateToCashier) { Text("Cashier") }
            Button(onClick = onNavigateToProfile) { Text("Profile") }
        }
    }
}
