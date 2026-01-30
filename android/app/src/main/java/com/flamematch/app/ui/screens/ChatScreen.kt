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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
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

data class Message(val text: String, val isMine: Boolean)

@Composable
fun ChatScreen(
    otherUserId: String?,
    onNavigateBack: () -> Unit
) {
    var messageText by remember { mutableStateOf("") }
    var messages by remember { mutableStateOf(listOf(
        Message("Ciao! Come va?", false),
        Message("Tutto bene! Tu?", true),
        Message("Benissimo! Che fai stasera?", false)
    ))}
    
    Column(
        modifier = Modifier.fillMaxSize().background(DarkBackground)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            TextButton(onClick = onNavigateBack) {
                Text("← Indietro", color = FlameRed)
            }
            Text("Chat", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color.White)
            Text("💬", fontSize = 24.sp)
        }
        
        LazyColumn(
            modifier = Modifier.weight(1f).padding(horizontal = 16.dp),
            reverseLayout = true
        ) {
            items(messages.reversed()) { message ->
                Row(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                    horizontalArrangement = if (message.isMine) Arrangement.End else Arrangement.Start
                ) {
                    Card(
                        colors = CardDefaults.cardColors(
                            containerColor = if (message.isMine) FlameRed else CardBackground
                        ),
                        shape = RoundedCornerShape(16.dp)
                    ) {
                        Text(
                            text = message.text,
                            modifier = Modifier.padding(12.dp),
                            color = Color.White
                        )
                    }
                }
            }
        }
        
        Row(
            modifier = Modifier.fillMaxWidth().padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedTextField(
                value = messageText,
                onValueChange = { messageText = it },
                modifier = Modifier.weight(1f),
                placeholder = { Text("Scrivi messaggio...") },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = FlameRed,
                    unfocusedBorderColor = Color.Gray,
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White
                ),
                singleLine = true
            )
            Spacer(modifier = Modifier.width(8.dp))
            Button(
                onClick = {
                    if (messageText.isNotBlank()) {
                        messages = messages + Message(messageText, true)
                        messageText = ""
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = FlameRed)
            ) {
                Text("Invia")
            }
        }
    }
}
