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
import com.flamematch.app.ui.theme.CardBackground
import com.flamematch.app.ui.theme.DarkBackground

@Composable
fun TableScreen(
    table: TableSummary?,
    chipsOnTable: Int,
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
            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("Board", color = Color.LightGray)
                Text("A♠ K♣ 9♦ | 4♥ | 2♠", color = Color.White, fontSize = 20.sp)
                Text("Hole cards", color = Color.LightGray)
                Text("Q♠ Q♥", color = Color.White, fontSize = 20.sp)
            }
        }

        Spacer(modifier = Modifier.height(20.dp))
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Button(onClick = { }) { Text("Fold") }
            Button(onClick = { }) { Text("Call") }
            Button(onClick = { }) { Text("Raise") }
        }
    }
}
