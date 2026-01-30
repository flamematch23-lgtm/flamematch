package com.flamematch.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.flamematch.app.ui.theme.FlameRed
import com.flamematch.app.ui.theme.FlameOrange
import com.flamematch.app.ui.theme.DarkBackground
import com.flamematch.app.ui.theme.CardBackground
import com.flamematch.app.viewmodel.AuthViewModel

@Composable
fun HomeScreen(
    viewModel: AuthViewModel,
    onNavigateToDiscover: () -> Unit,
    onNavigateToMatches: () -> Unit,
    onNavigateToLikes: () -> Unit,
    onNavigateToChat: () -> Unit,
    onNavigateToProfile: () -> Unit,
    onNavigateToWallet: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(text = "🔥", fontSize = 60.sp)
        Text(text = "FlameMatch", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = FlameRed)
        Text(text = "Ciao ${viewModel.currentUser?.name ?: "User"}!", fontSize = 18.sp, color = Color.White)
        
        Spacer(modifier = Modifier.height(32.dp))
        
        HomeButton("🔍 Scopri", FlameRed, onNavigateToDiscover)
        HomeButton("💕 Matches", FlameOrange, onNavigateToMatches)
        HomeButton("❤️ Likes", Color(0xFFE91E63), onNavigateToLikes)
        HomeButton("💬 Chat", Color(0xFF9C27B0), onNavigateToChat)
        HomeButton("👤 Profilo", Color(0xFF2196F3), onNavigateToProfile)
        HomeButton("💰 Wallet", Color(0xFFFFD700), onNavigateToWallet)
    }
}

@Composable
private fun HomeButton(text: String, color: Color, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth().height(56.dp).padding(vertical = 4.dp),
        colors = ButtonDefaults.buttonColors(containerColor = color),
        shape = RoundedCornerShape(16.dp)
    ) {
        Text(text, fontSize = 18.sp, fontWeight = FontWeight.Bold)
    }
}
