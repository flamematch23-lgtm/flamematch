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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.flamematch.app.ui.theme.FlameRed
import com.flamematch.app.ui.theme.FlameOrange
import com.flamematch.app.ui.theme.DarkBackground
import com.flamematch.app.ui.theme.CardBackground

data class LikeProfile(
    val id: String,
    val name: String,
    val age: Int,
    val emoji: String,
    val isNew: Boolean = false
)

@Composable
fun LikesScreen(
    onNavigateBack: () -> Unit,
    onNavigateToChat: (String) -> Unit
) {
    var likes by remember { mutableStateOf(listOf(
        LikeProfile("1", "Valentina", 25, "😍", true),
        LikeProfile("2", "Alessia", 23, "💕", true),
        LikeProfile("3", "Francesca", 27, "🔥", false),
        LikeProfile("4", "Giulia", 24, "💖", false)
    )) }
    
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(DarkBackground, Color(0xFF1A1A2E))
                )
            )
    ) {
        Column(
            modifier = Modifier.fillMaxSize().padding(16.dp)
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                TextButton(onClick = onNavigateBack) {
                    Text("← Indietro", color = FlameRed)
                }
                Text("❤️ Chi ti ha messo Like", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White)
                Text("${likes.size}", fontSize = 16.sp, color = FlameRed)
            }
            
            if (likes.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("💔", fontSize = 64.sp)
                        Spacer(modifier = Modifier.height(16.dp))
                        Text("Nessun like ancora", fontSize = 18.sp, color = Color.White)
                        Text("Continua a scoprire nuovi profili!", fontSize = 14.sp, color = Color.Gray)
                    }
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(likes) { profile ->
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = CardBackground),
                            shape = RoundedCornerShape(16.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth().padding(16.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                // Avatar
                                Box(
                                    modifier = Modifier
                                        .size(60.dp)
                                        .clip(CircleShape)
                                        .background(
                                            Brush.linearGradient(
                                                colors = listOf(FlameRed, FlameOrange)
                                            )
                                        ),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(profile.emoji, fontSize = 28.sp)
                                }
                                
                                // Info
                                Column(
                                    modifier = Modifier.weight(1f).padding(horizontal = 12.dp)
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(
                                            "${profile.name}, ${profile.age}",
                                            fontSize = 16.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Color.White
                                        )
                                        if (profile.isNew) {
                                            Text(
                                                " NEW",
                                                fontSize = 10.sp,
                                                color = FlameOrange,
                                                fontWeight = FontWeight.Bold
                                            )
                                        }
                                    }
                                    Text("Ti ha messo like!", fontSize = 12.sp, color = Color.Gray)
                                }
                                
                                // Like back button
                                Button(
                                    onClick = { onNavigateToChat(profile.id) },
                                    colors = ButtonDefaults.buttonColors(containerColor = FlameRed),
                                    shape = RoundedCornerShape(20.dp)
                                ) {
                                    Text("💕 Match", fontSize = 12.sp)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
