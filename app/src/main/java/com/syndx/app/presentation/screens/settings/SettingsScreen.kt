package com.syndx.app.presentation.screens.settings

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.syndx.app.data.datastore.ClinicianDataStore
import com.syndx.app.domain.model.Clinician
import com.syndx.app.presentation.components.ThreeDBackground
import com.syndx.app.presentation.components.ThreeDCard
import com.syndx.app.ui.theme.*
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    clinician: Clinician?,
    clinicianDataStore: ClinicianDataStore,
    onLogout: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val prefs by clinicianDataStore.prefs.collectAsState(initial = null)

    var languageDropdownExpanded by remember { mutableStateOf(false) }
    val languages = listOf("English", "தமிழ்", "हिन्दी")

    var showEditProfileSheet by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Settings",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = TextPri
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Surface1)
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(BgCool)
        ) {
            ThreeDBackground()

            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                item { Spacer(Modifier.height(4.dp)) }

                // Section 1: Clinician Profile Card
                item {
                    val name = clinician?.fullName ?: "Clinician"
                    val initials = name.split(" ")
                        .filter { it.isNotBlank() }
                        .take(2)
                        .map { it.first().uppercase() }
                        .joinToString("")
                        .ifEmpty { "C" }

                    ThreeDCard(
                        modifier = Modifier.fillMaxWidth(),
                        elevation = 6.dp
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(18.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(56.dp)
                                        .clip(CircleShape)
                                        .background(Teal700),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = initials,
                                        style = MaterialTheme.typography.titleLarge,
                                        color = Color.White,
                                        fontWeight = FontWeight.Bold
                                    )
                                }

                                Spacer(Modifier.width(16.dp))

                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = name,
                                        style = MaterialTheme.typography.titleLarge,
                                        fontWeight = FontWeight.Bold,
                                        color = TextPri
                                    )
                                    Spacer(Modifier.height(2.dp))
                                    Text(
                                        text = "${clinician?.clinicianId ?: "SYN-000000"} · ${clinician?.designation ?: "Medical Officer"}",
                                        style = MaterialTheme.typography.labelMedium,
                                        color = TextSec
                                    )
                                    Text(
                                        text = "PHC Code: ${clinician?.phcCode ?: "PHC-DEFAULT"}",
                                        style = MaterialTheme.typography.labelMedium,
                                        color = TextSec
                                    )
                                }
                            }

                            Spacer(Modifier.height(12.dp))
                            HorizontalDivider(color = DividerCol)
                            Spacer(Modifier.height(6.dp))

                            TextButton(
                                onClick = { showEditProfileSheet = true },
                                modifier = Modifier.align(Alignment.End)
                            ) {
                                Text("Edit Profile", color = Teal700, fontWeight = FontWeight.SemiBold)
                            }
                        }
                    }
                }

                // Section 2: App Settings
                item {
                    Text(
                        text = "App Settings",
                        style = MaterialTheme.typography.labelLarge,
                        color = TextSec,
                        fontWeight = FontWeight.SemiBold
                    )
                }

                item {
                    ThreeDCard(modifier = Modifier.fillMaxWidth(), elevation = 3.dp) {
                        Column(modifier = Modifier.padding(8.dp)) {
                            // Language
                            ListItem(
                                headlineContent = { Text("Language", style = MaterialTheme.typography.titleMedium) },
                                trailingContent = {
                                    Box {
                                        TextButton(onClick = { languageDropdownExpanded = true }) {
                                            Text(prefs?.language ?: "English", color = Teal700, fontWeight = FontWeight.Bold)
                                        }
                                        DropdownMenu(
                                            expanded = languageDropdownExpanded,
                                            onDismissRequest = { languageDropdownExpanded = false }
                                        ) {
                                            languages.forEach { lang ->
                                                DropdownMenuItem(
                                                    text = { Text(lang) },
                                                    onClick = {
                                                        scope.launch { clinicianDataStore.setLanguage(lang) }
                                                        languageDropdownExpanded = false
                                                    }
                                                )
                                            }
                                        }
                                    }
                                }
                            )

                            HorizontalDivider(color = DividerCol.copy(alpha = 0.5f))

                            // Offline Only Mode
                            val isOfflineOnly = prefs?.offlineOnlyMode ?: false
                            ListItem(
                                headlineContent = { Text("Offline Only Mode", style = MaterialTheme.typography.titleMedium) },
                                supportingContent = {
                                    if (isOfflineOnly) {
                                        Surface(
                                            color = WarnAmber.copy(alpha = 0.2f),
                                            shape = RoundedCornerShape(4.dp),
                                            modifier = Modifier.padding(top = 4.dp)
                                        ) {
                                            Text(
                                                text = "Network calls disabled",
                                                color = WarnAmber,
                                                style = MaterialTheme.typography.labelMedium,
                                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                            )
                                        }
                                    }
                                },
                                trailingContent = {
                                    Switch(
                                        checked = isOfflineOnly,
                                        onCheckedChange = { scope.launch { clinicianDataStore.setOfflineOnly(it) } },
                                        colors = SwitchDefaults.colors(checkedThumbColor = Teal700, checkedTrackColor = Teal100)
                                    )
                                }
                            )
                        }
                    }
                }

                // Section 3: About
                item {
                    Text(
                        text = "About",
                        style = MaterialTheme.typography.labelLarge,
                        color = TextSec,
                        fontWeight = FontWeight.SemiBold
                    )
                }

                item {
                    ThreeDCard(modifier = Modifier.fillMaxWidth(), elevation = 3.dp) {
                        Column(modifier = Modifier.padding(8.dp)) {
                            ListItem(
                                headlineContent = { Text("SynDx Version") },
                                trailingContent = { Text("1.0.0", color = TextSec, fontWeight = FontWeight.SemiBold) }
                            )
                            HorizontalDivider(color = DividerCol.copy(alpha = 0.5f))
                            ListItem(
                                headlineContent = { Text("Polygon Network") },
                                trailingContent = { Text("Mumbai Testnet", color = TextSec) }
                            )
                            HorizontalDivider(color = DividerCol.copy(alpha = 0.5f))
                            ListItem(
                                headlineContent = { Text("AI Model") },
                                trailingContent = { Text("Gemini 2.0 Flash", color = TextSec) }
                            )
                            HorizontalDivider(color = DividerCol.copy(alpha = 0.5f))
                            ListItem(
                                headlineContent = { Text("Research Foundation") },
                                trailingContent = {
                                    TextButton(onClick = {
                                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://arxiv.org"))
                                        context.startActivity(intent)
                                    }) {
                                        Text("BlockDP-FL (Mazid et al.)", color = Teal700)
                                    }
                                }
                            )
                        }
                    }
                }

                // Section 4: Account / Logout
                item {
                    ThreeDCard(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                scope.launch {
                                    clinicianDataStore.clearLogin()
                                    onLogout()
                                }
                            },
                        elevation = 3.dp
                    ) {
                        ListItem(
                            headlineContent = {
                                Text(
                                    text = "Logout",
                                    color = ErrorRed,
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold
                                )
                            },
                            leadingContent = {
                                Icon(Icons.Outlined.ExitToApp, contentDescription = "Logout", tint = ErrorRed)
                            }
                        )
                    }
                    Spacer(Modifier.height(80.dp))
                }
            }
        }
    }
}
