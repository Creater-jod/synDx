package com.syndx.app.presentation.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.foundation.gestures.waitForUpOrCancellation
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.syndx.app.ui.theme.Teal700

/**
 * 3D Tactile Button with realistic physical depression,
 * ambient shadow compression, and specular top highlight.
 */
@Composable
fun SynDxButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    isLoading: Boolean = false,
    backgroundColor: Color = Teal700,
    contentColor: Color = Color.White
) {
    var isPressed by remember { mutableStateOf(false) }
    val scale by animateFloatAsState(
        targetValue = if (isPressed && enabled && !isLoading) 0.965f else 1.0f,
        animationSpec = spring(dampingRatio = 0.7f, stiffness = 400f),
        label = "btn_scale"
    )
    val translationY by animateFloatAsState(
        targetValue = if (isPressed && enabled && !isLoading) 3f else 0f,
        animationSpec = spring(dampingRatio = 0.7f, stiffness = 400f),
        label = "btn_ty"
    )

    val shape = RoundedCornerShape(12.dp)
    val activeBg = if (enabled) backgroundColor else backgroundColor.copy(alpha = 0.45f)
    val shadowColor = if (enabled) backgroundColor.copy(alpha = 0.35f) else Color.Transparent

    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(52.dp)
            .graphicsLayer {
                scaleX = scale
                scaleY = scale
                this.translationY = translationY
            }
            .shadow(
                elevation = if (enabled && !isPressed) 6.dp else 1.dp,
                shape = shape,
                ambientColor = shadowColor,
                spotColor = shadowColor
            )
            .border(
                width = 1.dp,
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color.White.copy(alpha = if (enabled) 0.35f else 0.1f),
                        Color.Transparent
                    )
                ),
                shape = shape
            )
            .clip(shape)
            .background(activeBg)
            .then(
                if (enabled && !isLoading) {
                    Modifier.pointerInput(Unit) {
                        while (true) {
                            awaitPointerEventScope {
                                awaitFirstDown(requireUnconsumed = false)
                                isPressed = true
                                val upOrCancel = waitForUpOrCancellation()
                                isPressed = false
                                if (upOrCancel != null) {
                                    onClick()
                                }
                            }
                        }
                    }
                } else Modifier
            ),
        contentAlignment = Alignment.Center
    ) {
        if (isLoading) {
            CircularProgressIndicator(
                color = contentColor,
                strokeWidth = 2.5.dp,
                modifier = Modifier.size(24.dp)
            )
        } else {
            Text(
                text = text,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = contentColor
            )
        }
    }
}
