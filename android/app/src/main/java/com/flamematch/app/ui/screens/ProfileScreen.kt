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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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
import com.flamematch.app.viewmodel.AuthViewModel

@Composable
fun ProfileScreen(
    viewModel: AuthViewModel,
    onNavigateBack: () -> Unit,
    onLogout: () -> Unit
) {
    val user = viewModel.currentUser
    var name by remember { mutableStateOf(user?.name ?: "") }
    var bio by remember { mutableStateOf(user?.bio ?: "") }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(DarkBackground)
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            TextButton(onClick = onNavigateBack) {
                Text("← Indietro", color = FlameRed)
            }
            Text("Profilo", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color.White)
            Text("👤", fontSize = 24.sp)
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = CardBackground),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text("👤", fontSize = 80.sp)
                Spacer(modifier = Modifier.height(16.dp))
                Text(name, fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Color.White)
                Text(user?.email ?: "", color = Color.Gray)
                Spacer(modifier = Modifier.height(8.dp))
                Text("🔥 ${user?.points ?: 0} punti", color = FlameRed)
            }
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        OutlinedTextField(
            value = name,
            onValueChange = { name = it },
            label = { Text("Nome") },
            modifier = Modifier.fillMaxWidth(),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = FlameRed,
                unfocusedBorderColor = Color.Gray,
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White
            )
        )
        
        Spacer(modifier = Modifier.height(12.dp))
        
        OutlinedTextField(
            value = bio,
            onValueChange = { bio = it },
            label = { Text("Bio") },
            modifier = Modifier.fillMaxWidth().height(120.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = FlameRed,
                unfocusedBorderColor = Color.Gray,
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White
            )
        )
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Button(
            onClick = { /* Save profile */ },
            modifier = Modifier.fillMaxWidth().height(50.dp),
            colors = ButtonDefaults.buttonColors(containerColor = FlameRed),
            shape = RoundedCornerShape(25.dp)
        ) {
            Text("Salva Modifiche", fontWeight = FontWeight.Bold)
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Button(
            onClick = { viewModel.logout(); onLogout() },
            modifier = Modifier.fillMaxWidth().height(50.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color.Gray),
            shape = RoundedCornerShape(25.dp)
        ) {
            Text("Logout", fontWeight = FontWeight.Bold)
        }
    }
}
