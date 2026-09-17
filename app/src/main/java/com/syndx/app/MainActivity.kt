package com.syndx.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.syndx.app.presentation.navigation.SynDxNavGraph
import com.syndx.app.ui.theme.SynDxTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            SynDxTheme {
                SynDxNavGraph()
            }
        }
    }
}
