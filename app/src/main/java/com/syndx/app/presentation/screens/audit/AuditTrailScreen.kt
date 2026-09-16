package com.syndx.app.presentation.screens.audit

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.syndx.app.domain.model.AuditLog
import com.syndx.app.presentation.components.ThreeDBackground
import com.syndx.app.presentation.components.ThreeDCard
import com.syndx.app.presentation.viewmodel.AuditFilter
import com.syndx.app.presentation.viewmodel.AuditViewModel
import com.syndx.app.ui.theme.*
import com.syndx.app.util.DateUtil

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AuditTrailScreen(
    auditViewModel: AuditViewModel
) {
    val context = LocalContext.current

    val totalCount by auditViewModel.totalCount.collectAsState()
    val syncedCount by auditViewModel.syncedCount.collectAsState()
    val pendingCount by auditViewModel.pendingCount.collectAsState()
    val filteredLogs by auditViewModel.filteredLogs.collectAsState()
    val selectedFilter by auditViewModel.selectedFilter.collectAsState()
    val isSyncing by auditViewModel.isSyncing.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Blockchain Audit Trail",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = TextPri
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Surface1)
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { auditViewModel.syncPendingLogs() },
                containerColor = Teal700,
                contentColor = Color.White,
                shape = RoundedCornerShape(16.dp)
            ) {
                if (isSyncing) {
                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp), strokeWidth = 2.dp)
                } else {
                    Icon(Icons.Outlined.Sync, contentDescription = "Sync to Blockchain")
                }
            }
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(BgCool)
        ) {
            ThreeDBackground()

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp)
            ) {
                Spacer(Modifier.height(12.dp))

                // Summary Banner
                ThreeDCard(
                    modifier = Modifier.fillMaxWidth(),
                    backgroundColor = Teal100,
                    elevation = 4.dp
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "$totalCount events · $syncedCount synced · $pendingCount pending",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = TextPri
                        )
                        Icon(Icons.Outlined.Shield, contentDescription = null, tint = Teal700)
                    }
                }

                Spacer(Modifier.height(12.dp))

                // Filter Tabs
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(AuditFilter.values()) { filter ->
                        val isSelected = selectedFilter == filter
                        val label = when (filter) {
                            AuditFilter.ALL -> "All"
                            AuditFilter.DIAGNOSES -> "Diagnoses"
                            AuditFilter.REFERRALS -> "Referrals"
                            AuditFilter.ADR -> "ADR"
                        }
                        FilterChip(
                            selected = isSelected,
                            onClick = { auditViewModel.selectFilter(filter) },
                            label = { Text(label) },
                            shape = RoundedCornerShape(8.dp),
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = Teal700,
                                selectedLabelColor = Color.White
                            )
                        )
                    }
                }

                Spacer(Modifier.height(12.dp))

                // Audit Logs List
                if (filteredLogs.isEmpty()) {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text("No audit events recorded yet", color = TextSec, style = MaterialTheme.typography.bodyMedium)
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        items(filteredLogs) { log ->
                            AuditRowCard(log = log, context = context)
                        }
                        item { Spacer(Modifier.height(80.dp)) }
                    }
                }
            }
        }
    }
}

@Composable
fun AuditRowCard(log: AuditLog, context: Context) {
    val (icon, iconTint, label) = when (log.eventType) {
        "PATIENT_REGISTERED" -> Triple(Icons.Outlined.PersonAdd, Teal700, "Patient Registered")
        "DIAGNOSIS_COMPLETED" -> Triple(Icons.Outlined.MedicalServices, Teal700, "Diagnosis Completed")
        "REFERRAL_ISSUED" -> Triple(Icons.Outlined.Assignment, SuccessGrn, "Referral Issued")
        "ADR_REPORTED" -> Triple(Icons.Outlined.WarningAmber, Coral500, "ADR Reported")
        else -> Triple(Icons.Outlined.CloudSync, TextSec, log.eventType)
    }

    val (statusBg, statusFg, statusLabel) = when (log.syncStatus) {
        "SYNCED" -> Triple(SuccessGrn.copy(alpha = 0.15f), SuccessGrn, "Synced")
        "PENDING" -> Triple(WarnAmber.copy(alpha = 0.15f), WarnAmber, "Pending")
        else -> Triple(ErrorRed.copy(alpha = 0.15f), ErrorRed, "Failed")
    }

    ThreeDCard(
        modifier = Modifier.fillMaxWidth(),
        elevation = 3.dp
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(icon, contentDescription = null, tint = iconTint, modifier = Modifier.size(24.dp))
                Spacer(Modifier.width(12.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(text = label, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold, color = TextPri)
                    Text(text = DateUtil.formatFull(log.timestamp), style = MaterialTheme.typography.labelMedium, color = TextSec)
                }
                Surface(
                    color = statusBg,
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Text(
                        text = statusLabel,
                        color = statusFg,
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                    )
                }
            }

            Spacer(Modifier.height(8.dp))
            HorizontalDivider(color = DividerCol.copy(alpha = 0.5f))
            Spacer(Modifier.height(6.dp))

            // Hashes
            val txDisplay = log.polygonTxHash ?: "Tx: Not broadcasted (Pending)"
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable {
                        val textToCopy = log.polygonTxHash ?: log.payloadHash
                        val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                        cm.setPrimaryClip(ClipData.newPlainText("AuditHash", textToCopy))
                        Toast.makeText(context, "Hash copied to clipboard", Toast.LENGTH_SHORT).show()
                    },
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = if (log.polygonTxHash != null) "Tx: ${log.polygonTxHash.take(18)}…" else "Payload: ${log.payloadHash.take(18)}…",
                    style = MaterialTheme.typography.labelMedium,
                    fontFamily = FontFamily.Monospace,
                    color = Teal700
                )
                Icon(Icons.Outlined.ContentCopy, contentDescription = "Copy", modifier = Modifier.size(14.dp), tint = Teal700)
            }
        }
    }
}
