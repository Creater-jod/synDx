package com.syndx.app.presentation.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.syndx.app.ui.theme.Teal700
import com.syndx.app.ui.theme.TextPri
import com.syndx.app.ui.theme.TextSec

@Composable
fun DiagnosisCard(
    patientName: String,
    disease: String,
    timeText: String,
    urgency: String,
    confidenceScore: Float,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    ThreeDCard(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        elevation = 4.dp,
        onClick = onClick
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = patientName,
                    style = MaterialTheme.typography.titleMedium,
                    color = TextPri,
                    fontWeight = FontWeight.SemiBold
                )
                Spacer(Modifier.height(2.dp))
                Text(
                    text = disease,
                    style = MaterialTheme.typography.bodyMedium,
                    color = TextSec
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    text = timeText,
                    style = MaterialTheme.typography.labelMedium,
                    color = TextSec.copy(alpha = 0.8f)
                )
            }

            Spacer(Modifier.width(12.dp))

            Column(horizontalAlignment = Alignment.End) {
                UrgencyBadge(urgency = urgency)
                Spacer(Modifier.height(6.dp))
                Text(
                    text = "${(confidenceScore * 100).toInt()}% Conf.",
                    style = MaterialTheme.typography.labelMedium,
                    color = Teal700,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
