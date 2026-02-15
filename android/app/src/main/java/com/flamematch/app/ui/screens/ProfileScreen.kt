package com.flamematch.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.flamematch.app.data.PokerUser
import com.flamematch.app.data.WalletAccount
import com.flamematch.app.ui.theme.CardBackground
import com.flamematch.app.ui.theme.DarkBackground

@Composable
fun ProfileScreen(user: PokerUser, wallet: WalletAccount, onNavigateBack: () -> Unit) {
    var nickname by remember { mutableStateOf(user.nickname) }

    Column(modifier = Modifier.fillMaxSize().background(DarkBackground).padding(16.dp)) {
        TextButton(onClick = onNavigateBack) { Text("← Lobby") }
        Text("Profile", color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Bold)

        Spacer(modifier = Modifier.height(16.dp))
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = CardBackground),
            shape = RoundedCornerShape(14.dp)
        ) {
            Column(Modifier.padding(16.dp)) {
                Text("Nickname", color = Color.Gray)
                OutlinedTextField(value = nickname, onValueChange = { nickname = it }, modifier = Modifier.fillMaxWidth())
                Spacer(modifier = Modifier.height(12.dp))
                Text("Bankroll: ${wallet.balance} chips", color = Color.White)
                Text("Chips in gioco: ${wallet.chipsOnTable}", color = Color.LightGray)
                Spacer(modifier = Modifier.height(12.dp))
                Text("Hands giocate: ${user.totalHands}", color = Color.White)
                Text("Hands vinte: ${user.handsWon}", color = Color.LightGray)
                Text("Winrate: ${"%.1f".format(user.winRate)}%", color = Color.LightGray)
                Text("Net chips: ${user.netChips}", color = Color.LightGray)
            }
        }
    }
}
