package com.flamematch.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.flamematch.app.ui.theme.FlameRed
import com.flamematch.app.ui.theme.DarkBackground
import com.flamematch.app.ui.theme.CardBackground

data class Profile(val name: String, val age: Int, val bio: String, val emoji: String)

@Deprecated("Legacy social screen: migration in progress to poker flows")
@Composable
fun DiscoverScreen(onNavigateBack: () -> Unit) {
    val profiles = listOf(
        Profile("Sofia", 24, "Amo viaggiare e scoprire nuove culture", "👩"),
        Profile("Marco", 28, "Appassionato di musica e cinema", "👨"),
        Profile("Giulia", 26, "Sport e natura sono la mia passione", "👩"),
        Profile("Luca", 30, "Chef amatoriale, amo cucinare", "👨")
    )
    var currentIndex by remember { mutableStateOf(0) }
    
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
            Text("Scopri", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color.White)
            Text("${currentIndex + 1}/${profiles.size}", color = Color.Gray)
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        if (currentIndex < profiles.size) {
            val profile = profiles[currentIndex]
            Card(
                modifier = Modifier.fillMaxWidth().weight(1f),
                colors = CardDefaults.cardColors(containerColor = CardBackground),
                shape = RoundedCornerShape(24.dp)
            ) {
                Column(
                    modifier = Modifier.fillMaxSize().padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text(profile.emoji, fontSize = 120.sp)
                    Spacer(modifier = Modifier.height(16.dp))
                    Text("${profile.name}, ${profile.age}", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(profile.bio, fontSize = 16.sp, color = Color.Gray)
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                Button(
                    onClick = { if (currentIndex < profiles.size - 1) currentIndex++ },
                    colors = ButtonDefaults.buttonColors(containerColor = Color.Gray),
                    shape = CircleShape,
                    modifier = Modifier.size(72.dp)
                ) {
                    Text("✕", fontSize = 28.sp)
                }
                Button(
                    onClick = { if (currentIndex < profiles.size - 1) currentIndex++ },
                    colors = ButtonDefaults.buttonColors(containerColor = FlameRed),
                    shape = CircleShape,
                    modifier = Modifier.size(72.dp)
                ) {
                    Text("❤️", fontSize = 28.sp)
                }
            }
        } else {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("🔥", fontSize = 60.sp)
                    Spacer(modifier = Modifier.height(16.dp))
                    Text("Hai visto tutti i profili!", fontSize = 20.sp, color = Color.White)
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = { currentIndex = 0 },
                        colors = ButtonDefaults.buttonColors(containerColor = FlameRed)
                    ) {
                        Text("Ricomincia")
                    }
                }
            }
        }
    }
}
