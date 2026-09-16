package com.syndx.app.presentation.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.People
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.Shield
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import com.syndx.app.presentation.navigation.Screen
import com.syndx.app.ui.theme.Surface1
import com.syndx.app.ui.theme.Teal100
import com.syndx.app.ui.theme.Teal700
import com.syndx.app.ui.theme.TextSec

data class NavItem(
    val route: String,
    val label: String,
    val icon: ImageVector
)

val bottomNavItems = listOf(
    NavItem(Screen.Dashboard.route, "Home", Icons.Outlined.Home),
    NavItem(Screen.PatientList.route, "Patients", Icons.Outlined.People),
    NavItem(Screen.AuditTrail.route, "Audit", Icons.Outlined.Shield),
    NavItem(Screen.Settings.route, "Profile", Icons.Outlined.Person),
)

@Composable
fun SynDxBottomNav(
    currentRoute: String?,
    onNavigate: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    NavigationBar(
        modifier = modifier,
        containerColor = Surface1,
        tonalElevation = 6.dp
    ) {
        bottomNavItems.forEach { item ->
            val selected = currentRoute == item.route
            NavigationBarItem(
                selected = selected,
                onClick = {
                    if (currentRoute != item.route) {
                        onNavigate(item.route)
                    }
                },
                icon = {
                    Icon(
                        imageVector = item.icon,
                        contentDescription = item.label
                    )
                },
                label = {
                    Text(
                        text = item.label,
                        style = MaterialTheme.typography.labelMedium
                    )
                },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = Teal700,
                    selectedTextColor = Teal700,
                    indicatorColor = Teal100,
                    unselectedIconColor = TextSec,
                    unselectedTextColor = TextSec
                )
            )
        }
    }
}
