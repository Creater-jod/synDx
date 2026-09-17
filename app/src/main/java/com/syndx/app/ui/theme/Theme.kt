package com.syndx.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val SynDxColorScheme = lightColorScheme(
    primary            = Teal700,
    onPrimary          = Color.White,
    primaryContainer   = Teal100,
    onPrimaryContainer = TextPri,
    secondary          = Coral500,
    onSecondary        = Color.White,
    secondaryContainer = Coral100,
    background         = BgCool,
    surface            = Surface1,
    onBackground       = TextPri,
    onSurface          = TextPri,
    error              = ErrorRed,
    onError            = Color.White,
)

@Composable
fun SynDxTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = SynDxColorScheme,
        typography  = SynDxTypography,
        shapes      = SynDxShapes,
        content     = content,
    )
}
