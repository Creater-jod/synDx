package com.syndx.app.presentation.screens.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import com.syndx.app.presentation.components.SynDxButton
import com.syndx.app.presentation.components.ThreeDBackground
import com.syndx.app.presentation.viewmodel.AuthViewModel
import com.syndx.app.presentation.viewmodel.UiState
import com.syndx.app.ui.theme.*

@Composable
fun LoginScreen(
    authViewModel: AuthViewModel,
    onLoginSuccess: () -> Unit,
    onNavigateToSignUp: () -> Unit
) {
    var clinicianId by remember { mutableStateOf("") }
    var pin by remember { mutableStateOf("") }

    val loginState by authViewModel.loginState.collectAsState()

    LaunchedEffect(loginState) {
        if (loginState is UiState.Success) {
            authViewModel.resetState()
            onLoginSuccess()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BgCool)
    ) {
        ThreeDBackground()

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
        ) {
            // Top 35%: Curved Header Box
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(260.dp)
                    .background(
                        color = Teal700,
                        shape = RoundedCornerShape(bottomStart = 32.dp, bottomEnd = 32.dp)
                    ),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.padding(24.dp)
                ) {
                    Text(
                        text = "SynDx",
                        style = MaterialTheme.typography.displayMedium,
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(Modifier.height(6.dp))
                    Text(
                        text = "Clinical Decision Support",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.White.copy(alpha = 0.85f)
                    )
                }
            }

            // Bottom 65%: Login Form
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp)
            ) {
                Spacer(Modifier.height(8.dp))
                Text(
                    text = "Welcome Back",
                    style = MaterialTheme.typography.headlineMedium,
                    color = TextPri,
                    fontWeight = FontWeight.Bold
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    text = "Sign in to your clinician account",
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextSec
                )

                Spacer(Modifier.height(24.dp))

                OutlinedTextField(
                    value = clinicianId,
                    onValueChange = { clinicianId = it.uppercase() },
                    label = { Text("Clinician ID") },
                    placeholder = { Text("SYN-XXXXXX") },
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Teal700,
                        focusedLabelColor = Teal700
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(Modifier.height(16.dp))

                OutlinedTextField(
                    value = pin,
                    onValueChange = { if (it.length <= 6 && it.all { ch -> ch.isDigit() }) pin = it },
                    label = { Text("PIN") },
                    placeholder = { Text("••••••") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                    visualTransformation = PasswordVisualTransformation(),
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Teal700,
                        focusedLabelColor = Teal700
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                if (loginState is UiState.Error) {
                    Spacer(Modifier.height(8.dp))
                    Text(
                        text = (loginState as UiState.Error).message,
                        color = ErrorRed,
                        style = MaterialTheme.typography.bodyMedium
                    )
                }

                Spacer(Modifier.height(28.dp))

                SynDxButton(
                    text = "Sign In",
                    isLoading = loginState is UiState.Loading,
                    onClick = {
                        authViewModel.login(clinicianId, pin)
                    }
                )

                Spacer(Modifier.height(20.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("New clinician? ", style = MaterialTheme.typography.bodyMedium, color = TextSec)
                    TextButton(onClick = onNavigateToSignUp) {
                        Text(
                            "Register here",
                            style = MaterialTheme.typography.bodyMedium,
                            color = Teal700,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}
