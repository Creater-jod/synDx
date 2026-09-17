package com.syndx.app.presentation.components

import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.syndx.app.ui.theme.UrgencyEmergency
import com.syndx.app.ui.theme.UrgencyRoutine
import com.syndx.app.ui.theme.UrgencyUrgent

@Composable
fun UrgencyBadge(urgency: String, modifier: Modifier = Modifier) {
    val (color, label) = when (urgency.uppercase()) {
        "EMERGENCY" -> Pair(UrgencyEmergency, "Emergency")
        "URGENT"    -> Pair(UrgencyUrgent,    "Urgent")
        else        -> Pair(UrgencyRoutine,   "Routine")
    }
    Surface(
        color = color.copy(alpha = 0.15f),
        shape = RoundedCornerShape(6.dp),
        modifier = modifier
    ) {
        Text(
            text = label,
            color = color,
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
        )
    }
}
