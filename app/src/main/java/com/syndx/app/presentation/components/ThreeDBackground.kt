package com.syndx.app.presentation.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.DrawScope
import com.syndx.app.ui.theme.BgCool
import com.syndx.app.ui.theme.Coral100
import com.syndx.app.ui.theme.Teal100
import com.syndx.app.ui.theme.Teal400
import com.syndx.app.ui.theme.Teal700
import kotlin.math.cos
import kotlin.math.sin

private data class Point3D(val x: Float, val y: Float, val z: Float, val radius: Float)

/**
 * High-performance 3D Spatial Canvas Background.
 * Renders a futuristic clinical grid with perspective projection lines,
 * floating 3D molecular/geometric nodes, and a chromatic medical aura.
 */
@Composable
fun ThreeDBackground(
    modifier: Modifier = Modifier,
    isDark: Boolean = false
) {
    val transition = rememberInfiniteTransition(label = "3d_bg_anim")
    val angle by transition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(28000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "rotation_angle"
    )
    val pulse by transition.animateFloat(
        initialValue = 0.85f,
        targetValue = 1.15f,
        animationSpec = infiniteRepeatable(
            animation = tween(6000, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "aura_pulse"
    )

    // Pre-generate 3D floating nodes
    val nodes3D = remember {
        listOf(
            Point3D(-140f, -80f, 60f, 6f),
            Point3D(120f, -120f, -40f, 5f),
            Point3D(-90f, 130f, -80f, 7f),
            Point3D(150f, 90f, 50f, 6f),
            Point3D(-40f, -160f, 100f, 4f),
            Point3D(60f, 150f, -100f, 5f),
            Point3D(180f, -30f, 30f, 6f),
            Point3D(-170f, 40f, -60f, 5f)
        )
    }

    Canvas(modifier = modifier.fillMaxSize()) {
        val width = size.width
        val height = size.height
        val centerX = width / 2f
        val centerY = height * 0.35f // Slightly elevated vanishing point

        // 1. Base ambient gradient
        drawRect(
            brush = Brush.verticalGradient(
                colors = if (isDark) listOf(
                    Color(0xFF00383D),
                    Color(0xFF001F22)
                ) else listOf(
                    BgCool,
                    Teal100.copy(alpha = 0.35f),
                    Coral100.copy(alpha = 0.2f)
                )
            )
        )

        // 2. 3D Chromatic Radial Light Cone (Simulating surgical/overhead clinical lamp)
        drawCircle(
            brush = Brush.radialGradient(
                colors = listOf(
                    Teal400.copy(alpha = 0.22f * pulse),
                    Teal100.copy(alpha = 0.12f * pulse),
                    Color.Transparent
                ),
                center = Offset(centerX, centerY),
                radius = width * 0.75f * pulse
            )
        )

        // 3. Perspective 3D Grid Lines converging to vanishing horizon
        val radAngle = Math.toRadians(angle.toDouble()).toFloat()
        val horizonY = centerY
        val gridColor = Teal700.copy(alpha = 0.07f)

        // Longitudinal rays
        for (i in -6..6) {
            val startX = centerX + (i * (width / 6f))
            val startY = height
            drawLine(
                color = gridColor,
                start = Offset(startX, startY),
                end = Offset(centerX, horizonY),
                strokeWidth = 1.5f
            )
        }

        // Latitudinal depth rings
        for (j in 1..5) {
            val factor = j / 5f
            val ringY = horizonY + (height - horizonY) * (factor * factor)
            val ringHalfW = (width * 0.8f) * factor
            drawLine(
                color = gridColor,
                start = Offset(centerX - ringHalfW, ringY),
                end = Offset(centerX + ringHalfW, ringY),
                strokeWidth = 1.2f
            )
        }

        // 4. Rotating 3D Floating Molecular Nodes
        val fov = 300f // Field of view
        val cosA = cos(radAngle)
        val sinA = sin(radAngle)

        nodes3D.forEach { pt ->
            // Rotate around Y-axis
            val rotX = pt.x * cosA - pt.z * sinA
            val rotZ = pt.x * sinA + pt.z * cosA + 200f // Shift Z forward
            val rotY = pt.y

            if (rotZ > 20f) {
                val scale = fov / (fov + rotZ)
                val projX = centerX + rotX * scale
                val projY = centerY + rotY * scale
                val projectedRadius = (pt.radius * scale).coerceAtLeast(2f)

                // Depth-tinted node
                val alpha = (scale * 0.45f).coerceIn(0.1f, 0.6f)
                drawCircle(
                    color = Teal700.copy(alpha = alpha),
                    center = Offset(projX, projY),
                    radius = projectedRadius
                )

                // Depth connector line to center
                drawLine(
                    color = Teal400.copy(alpha = alpha * 0.35f),
                    start = Offset(centerX, centerY),
                    end = Offset(projX, projY),
                    strokeWidth = 1f
                )
            }
        }
    }
}
