package com.flamematch.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
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
import androidx.compose.material3.CircularProgressIndicator
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
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.flamematch.app.ui.theme.FlameRed
import com.flamematch.app.ui.theme.FlameOrange
import com.flamematch.app.ui.theme.DarkBackground
import com.flamematch.app.viewmodel.AuthViewModel

@Composable
fun RegisterScreen(
    viewModel: AuthViewModel,
    onNavigateToLogin: () -> Unit,
    onNavigateToHome: () -> Unit
) {
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var age by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }

    Box(
        modifier = Modifier.fillMaxSize().background(DarkBackground)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(text = "🔥", fontSize = 60.sp)
            Spacer(modifier = Modifier.height(8.dp))
            Text("Crea Account", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = FlameRed)
            
            Spacer(modifier = Modifier.height(32.dp))
            
            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Nome") },
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = FlameRed, unfocusedBorderColor = Color.Gray,
                    focusedTextColor = Color.White, unfocusedTextColor = Color.White
                ),
                singleLine = true
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text("Email") },
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = FlameRed, unfocusedBorderColor = Color.Gray,
                    focusedTextColor = Color.White, unfocusedTextColor = Color.White
                ),
                singleLine = true
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text("Password") },
                modifier = Modifier.fillMaxWidth(),
                visualTransformation = PasswordVisualTransformation(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = FlameRed, unfocusedBorderColor = Color.Gray,
                    focusedTextColor = Color.White, unfocusedTextColor = Color.White
                ),
                singleLine = true
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            OutlinedTextField(
                value = age,
                onValueChange = { age = it.filter { c -> c.isDigit() } },
                label = { Text("Età") },
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = FlameRed, unfocusedBorderColor = Color.Gray,
                    focusedTextColor = Color.White, unfocusedTextColor = Color.White
                ),
                singleLine = true
            )
            
            if (errorMessage.isNotEmpty()) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(text = errorMessage, color = Color.Red, fontSize = 14.sp)
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            Button(
                onClick = {
                    val ageInt = age.toIntOrNull() ?: 0
                    if (name.isNotBlank() && email.isNotBlank() && password.length >= 6 && ageInt >= 18) {
                        isLoading = true
                        errorMessage = ""
                        viewModel.register(name, email, password, ageInt,
                            onSuccess = { isLoading = false; onNavigateToHome() },
                            onError = { isLoading = false; errorMessage = it }
                        )
                    } else {
                        errorMessage = when {
                            name.isBlank() -> "Inserisci il nome"
                            email.isBlank() -> "Inserisci email"
                            password.length < 6 -> "Password min 6 caratteri"
                            ageInt < 18 -> "Devi avere almeno 18 anni"
                            else -> "Compila tutti i campi"
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth().height(56.dp),
                colors = ButtonDefaults.buttonColors(containerColor = FlameRed),
                shape = RoundedCornerShape(28.dp),
                enabled = !isLoading
            ) {
                if (isLoading) CircularProgressIndicator(color = Color.White)
                else Text("Registrati", fontSize = 18.sp, fontWeight = FontWeight.Bold)
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            TextButton(onClick = onNavigateToLogin) {
                Text("Hai già un account? Accedi", color = FlameOrange)
            }
        }
    }
}
