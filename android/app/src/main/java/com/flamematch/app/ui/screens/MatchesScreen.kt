package com.flamematch.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.flamematch.app.ui.theme.FlameRed
import com.flamematch.app.ui.theme.DarkBackground
import com.flamematch.app.ui.theme.CardBackground

data class Match(val id: String, val name: String, val emoji: String, val lastMessage: String)

@Deprecated("Legacy social screen: migration in progress to poker flows")
@Composable
fun MatchesScreen(
    onNavigateBack: () -> Unit,
    onNavigateToChat: (String) -> Unit
) {
    val matches = listOf(
        Match("1", "Sofia", "👩", "Ciao! Come stai?"),
        Match("2", "Marco", "👨", "Ci vediamo stasera?"),
        Match("3", "Giulia", "👩", "Mi è piaciuto molto!")
    )
    
    Column(
        modifier = Modifier.fillMaxSize().background(DarkBackground).padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            TextButton(onClick = onNavigateBack) {
                Text("← Indietro", color = FlameRed)
            }
            Text("Matches", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color.White)
            Text("💕", fontSize = 24.sp)
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        LazyColumn {
            items(matches) { match ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp)
                        .clickable { onNavigateToChat(match.id) },
                    colors = CardDefaults.cardColors(containerColor = CardBackground),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(match.emoji, fontSize = 40.sp, modifier = Modifier.size(50.dp))
                        Column(modifier = Modifier.padding(start = 12.dp)) {
                            Text(match.name, fontWeight = FontWeight.Bold, color = Color.White)
                            Text(match.lastMessage, color = Color.Gray, fontSize = 14.sp)
                        }
                    }
                }
            }
        }
    }
}
