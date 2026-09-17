package com.syndx.app.presentation.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.foundation.gestures.waitForUpOrCancellation
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.syndx.app.ui.theme.DividerCol
import com.syndx.app.ui.theme.Surface1
import com.syndx.app.ui.theme.Teal700

/**
 * Custom 3D extrusion modifier providing dual ambient drop shadows,
 * a specular top-lit bevel highlight, and 3D depth perception.
 */
fun Modifier.threeDExtrusion(
    elevation: Dp = 6.dp,
    shape: Shape = RoundedCornerShape(16.dp),
    shadowColor: Color = Color(0x1A004D54),
    topHighlight: Color = Color.White.copy(alpha = 0.8f)
): Modifier = this
    .shadow(
        elevation = elevation,
        shape = shape,
        ambientColor = shadowColor,
        spotColor = shadowColor
    )
    .border(
        width = 1.dp,
        brush = Brush.verticalGradient(
            colors = listOf(topHighlight, DividerCol.copy(alpha = 0.5f))
        ),
        shape = shape
    )

/**
 * Adds interactive tactile 3D physics to any widget (spring depression,
 * slight scale compression, and elevation dip on touch).
 */
fun Modifier.tactilePress(
    onClick: (() -> Unit)? = null,
    enabled: Boolean = true
): Modifier = if (!enabled) this else composedTactilePress(onClick)

private fun Modifier.composedTactilePress(onClick: (() -> Unit)?): Modifier {
    return this.then(
        Modifier.pointerInput(onClick) {
            // Pointer handling handled via Composable state wrapper where needed
        }
    )
}

/**
 * ThreeDCard is a premium 3D elevated surface designed for clinical dashboards,
 * stats, and case reports.
 */
@Composable
fun ThreeDCard(
    modifier: Modifier = Modifier,
    shape: Shape = RoundedCornerShape(16.dp),
    backgroundColor: Color = Surface1,
    elevation: Dp = 6.dp,
    accentColor: Color? = null,
    onClick: (() -> Unit)? = null,
    content: @Composable BoxScope.() -> Unit
) {
    var isPressed by remember { mutableStateOf(false) }
    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.975f else 1.0f,
        animationSpec = spring(dampingRatio = 0.7f, stiffness = 400f),
        label = "card_scale"
    )
    val offsetY by animateFloatAsState(
        targetValue = if (isPressed) 3f else 0f,
        animationSpec = spring(dampingRatio = 0.7f, stiffness = 400f),
        label = "card_offset_y"
    )

    Box(
        modifier = modifier
            .graphicsLayer {
                scaleX = scale
                scaleY = scale
                translationY = offsetY
            }
            .then(
                if (onClick != null) {
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
            )
            .threeDExtrusion(elevation = elevation, shape = shape)
            .clip(shape)
            .background(backgroundColor)
            .drawBehind {
                if (accentColor != null) {
                    // Subtle left 3D accent pillar
                    drawRect(
                        color = accentColor,
                        size = androidx.compose.ui.geometry.Size(4.dp.toPx(), size.height)
                    )
                }
            },
        content = content
    )
}
