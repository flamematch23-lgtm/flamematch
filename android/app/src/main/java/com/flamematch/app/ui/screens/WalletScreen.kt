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
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
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
import com.flamematch.app.ui.theme.GoldPremium
import com.flamematch.app.ui.theme.PlatinumPremium

@Composable
fun WalletScreen(onNavigateBack: () -> Unit) {
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
            Text("Wallet", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color.White)
            Text("💰", fontSize = 24.sp)
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        // Points Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = CardBackground),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text("🔥 I Tuoi Punti", fontSize = 18.sp, color = Color.White)
                Text("500", fontSize = 48.sp, fontWeight = FontWeight.Bold, color = FlameRed)
                Text("punti disponibili", color = Color.Gray)
            }
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Text("Compra Punti", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color.White)
        Spacer(modifier = Modifier.height(12.dp))
        
        listOf(
            Triple("100 punti", "€4.99", FlameOrange),
            Triple("500 punti", "€19.99", FlameRed),
            Triple("1000 punti", "€34.99", GoldPremium)
        ).forEach { (points, price, color) ->
            Card(
                modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
                colors = CardDefaults.cardColors(containerColor = CardBackground),
                shape = RoundedCornerShape(12.dp)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp).fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(points, fontWeight = FontWeight.Bold, color = Color.White)
                    Button(
                        onClick = { },
                        colors = ButtonDefaults.buttonColors(containerColor = color),
                        shape = RoundedCornerShape(20.dp)
                    ) {
                        Text(price)
                    }
                }
            }
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Text("Premium", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color.White)
        Spacer(modifier = Modifier.height(12.dp))
        
        // Gold Premium
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = CardBackground),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Text("👑 Gold", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = GoldPremium)
                Spacer(modifier = Modifier.height(8.dp))
                Text("• Like illimitati", color = Color.White)
                Text("• Vedi chi ti ha messo like", color = Color.White)
                Text("• Super Like giornalieri", color = Color.White)
                Spacer(modifier = Modifier.height(12.dp))
                Button(
                    onClick = { },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = GoldPremium),
                    shape = RoundedCornerShape(25.dp)
                ) {
                    Text("€14.99/mese", color = Color.Black, fontWeight = FontWeight.Bold)
                }
            }
        }
        
        Spacer(modifier = Modifier.height(12.dp))
        
        // Platinum Premium
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = CardBackground),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Text("💎 Platinum", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = PlatinumPremium)
                Spacer(modifier = Modifier.height(8.dp))
                Text("• Tutto di Gold +", color = Color.White)
                Text("• Priorità nel feed", color = Color.White)
                Text("• Messaggi prioritari", color = Color.White)
                Text("• Badge esclusivo", color = Color.White)
                Spacer(modifier = Modifier.height(12.dp))
                Button(
                    onClick = { },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = PlatinumPremium),
                    shape = RoundedCornerShape(25.dp)
                ) {
                    Text("€24.99/mese", color = Color.Black, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
