package com.syndx.app.presentation.navigation

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.syndx.app.SynDxApp
import com.syndx.app.presentation.components.SynDxBottomNav
import com.syndx.app.presentation.screens.adr.ADRScreen
import com.syndx.app.presentation.screens.audit.AuditTrailScreen
import com.syndx.app.presentation.screens.auth.LoginScreen
import com.syndx.app.presentation.screens.auth.SignUpScreen
import com.syndx.app.presentation.screens.dashboard.DashboardScreen
import com.syndx.app.presentation.screens.diagnosis.DiagnosisScreen
import com.syndx.app.presentation.screens.onboarding.OnboardingScreen
import com.syndx.app.presentation.screens.patients.PatientListScreen
import com.syndx.app.presentation.screens.patients.PatientRegistrationScreen
import com.syndx.app.presentation.screens.referral.ReferralScreen
import com.syndx.app.presentation.screens.settings.SettingsScreen
import com.syndx.app.presentation.screens.splash.SplashScreen
import com.syndx.app.presentation.screens.symptoms.SymptomInputScreen
import com.syndx.app.presentation.viewmodel.*

@Composable
fun SynDxNavGraph() {
    val navController = rememberNavController()
    val app = SynDxApp.instance

    // ViewModels instantiated via application singleton
    val authViewModel = remember {
        AuthViewModel(app.loginUseCase, app.registerClinicianUseCase, app.clinicianDataStore)
    }
    val dashboardViewModel = remember {
        DashboardViewModel(
            app.patientRepository,
            app.diagnosisRepository,
            app.auditRepository,
            app.database.clinicianDao(),
            app.clinicianDataStore,
            app.networkUtil
        )
    }
    val patientViewModel = remember {
        PatientViewModel(
            app.patientRepository,
            app.diagnosisRepository,
            app.savePatientUseCase,
            app.clinicianDataStore
        )
    }
    val diagnosisViewModel = remember {
        DiagnosisViewModel(
            null,
            app.diagnoseSymptomUseCase,
            app.getDiagnosisUseCase,
            app.patientRepository,
            app.diagnosisRepository,
            app.auditRepository
        )
    }
    val referralViewModel = remember {
        ReferralViewModel(
            null,
            app.diagnosisRepository,
            app.patientRepository,
            app.auditRepository,
            app.database.clinicianDao(),
            app.clinicianDataStore,
            app.generateReferralUseCase
        )
    }
    val auditViewModel = remember {
        AuditViewModel(app.syncAuditUseCase)
    }
    val adrViewModel = remember {
        ADRViewModel(null, app.diagnosisRepository, app.logADREventUseCase)
    }

    val currentBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = currentBackStackEntry?.destination?.route

    val bottomNavRoutes = setOf(
        Screen.Dashboard.route,
        Screen.PatientList.route,
        Screen.AuditTrail.route,
        Screen.Settings.route
    )

    val showBottomNav = currentRoute in bottomNavRoutes

    Scaffold(
        bottomBar = {
            if (showBottomNav) {
                SynDxBottomNav(
                    currentRoute = currentRoute,
                    onNavigate = { route ->
                        navController.navigate(route) {
                            popUpTo(Screen.Dashboard.route) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                )
            }
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            NavHost(
                navController = navController,
                startDestination = Screen.Splash.route
            ) {
                // 1. Splash
                composable(Screen.Splash.route) {
                    SplashScreen(
                        authViewModel = authViewModel,
                        isOnline = app.networkUtil.isOnline(),
                        onNavigateToOnboarding = {
                            navController.navigate(Screen.Onboarding.route) {
                                popUpTo(Screen.Splash.route) { inclusive = true }
                            }
                        },
                        onNavigateToLogin = {
                            navController.navigate(Screen.Login.route) {
                                popUpTo(Screen.Splash.route) { inclusive = true }
                            }
                        },
                        onNavigateToDashboard = {
                            navController.navigate(Screen.Dashboard.route) {
                                popUpTo(Screen.Splash.route) { inclusive = true }
                            }
                        }
                    )
                }

                // 2. Onboarding
                composable(Screen.Onboarding.route) {
                    OnboardingScreen(
                        authViewModel = authViewModel,
                        onFinishOnboarding = {
                            navController.navigate(Screen.Login.route) {
                                popUpTo(Screen.Onboarding.route) { inclusive = true }
                            }
                        }
                    )
                }

                // 3. Login
                composable(Screen.Login.route) {
                    LoginScreen(
                        authViewModel = authViewModel,
                        onLoginSuccess = {
                            navController.navigate(Screen.Dashboard.route) {
                                popUpTo(Screen.Login.route) { inclusive = true }
                            }
                        },
                        onNavigateToSignUp = {
                            navController.navigate(Screen.SignUp.route)
                        }
                    )
                }

                // 4. SignUp
                composable(Screen.SignUp.route) {
                    SignUpScreen(
                        authViewModel = authViewModel,
                        onBackClick = { navController.popBackStack() },
                        onSignUpSuccess = {
                            navController.navigate(Screen.Dashboard.route) {
                                popUpTo(Screen.SignUp.route) { inclusive = true }
                            }
                        }
                    )
                }

                // 5. Dashboard
                composable(Screen.Dashboard.route) {
                    DashboardScreen(
                        dashboardViewModel = dashboardViewModel,
                        onNavigateToNewPatient = {
                            navController.navigate(Screen.PatientRegister.route)
                        },
                        onNavigateToPatientList = {
                            navController.navigate(Screen.PatientList.route)
                        },
                        onNavigateToADR = {
                            navController.navigate("adr")
                        },
                        onNavigateToAuditTrail = {
                            navController.navigate(Screen.AuditTrail.route)
                        },
                        onNavigateToDiagnosis = { sessionId ->
                            navController.navigate(Screen.Diagnosis.createRoute(sessionId))
                        }
                    )
                }

                // 6. Patient List
                composable(Screen.PatientList.route) {
                    PatientListScreen(
                        patientViewModel = patientViewModel,
                        onNavigateToNewPatient = {
                            navController.navigate(Screen.PatientRegister.route)
                        },
                        onNavigateToDiagnosis = { sessionId ->
                            navController.navigate(Screen.Diagnosis.createRoute(sessionId))
                        },
                        onNavigateToSymptoms = { patientId ->
                            navController.navigate(Screen.SymptomInput.createRoute(patientId))
                        }
                    )
                }

                // 7. Patient Register
                composable(Screen.PatientRegister.route) {
                    PatientRegistrationScreen(
                        patientViewModel = patientViewModel,
                        onBackClick = { navController.popBackStack() },
                        onNavigateToSymptoms = { patientId ->
                            navController.navigate(Screen.SymptomInput.createRoute(patientId))
                        }
                    )
                }

                // 8. Symptom Input
                composable(
                    route = Screen.SymptomInput.route,
                    arguments = listOf(navArgument("patientId") { type = NavType.StringType })
                ) { backStackEntry ->
                    val patientId = backStackEntry.arguments?.getString("patientId") ?: ""
                    SymptomInputScreen(
                        patientId = patientId,
                        patientRepository = app.patientRepository,
                        diagnosisViewModel = diagnosisViewModel,
                        onBackClick = { navController.popBackStack() },
                        onNavigateToDiagnosis = { sessionId ->
                            navController.navigate(Screen.Diagnosis.createRoute(sessionId)) {
                                popUpTo(Screen.Dashboard.route)
                            }
                        }
                    )
                }

                // 9. Diagnosis Screen
                composable(
                    route = Screen.Diagnosis.route,
                    arguments = listOf(navArgument("sessionId") { type = NavType.StringType })
                ) { backStackEntry ->
                    val sessionId = backStackEntry.arguments?.getString("sessionId") ?: ""
                    DiagnosisScreen(
                        sessionId = sessionId,
                        diagnosisViewModel = diagnosisViewModel,
                        onBackClick = { navController.popBackStack() },
                        onNavigateToReferral = { diagId ->
                            navController.navigate(Screen.Referral.createRoute(diagId))
                        },
                        onNavigateToADR = { diagId ->
                            navController.navigate("adr?diagnosisId=$diagId")
                        },
                        onNavigateToDashboard = {
                            navController.navigate(Screen.Dashboard.route) {
                                popUpTo(Screen.Dashboard.route) { inclusive = true }
                            }
                        }
                    )
                }

                // 10. Referral Screen
                composable(
                    route = Screen.Referral.route,
                    arguments = listOf(navArgument("diagnosisId") { type = NavType.StringType })
                ) { backStackEntry ->
                    val diagId = backStackEntry.arguments?.getString("diagnosisId") ?: ""
                    // Provide referralViewModel with diagId
                    val referralVM = remember(diagId) {
                        ReferralViewModel(
                            null,
                            app.diagnosisRepository,
                            app.patientRepository,
                            app.auditRepository,
                            app.database.clinicianDao(),
                            app.clinicianDataStore,
                            app.generateReferralUseCase
                        ).apply {
                            // Trigger load for this specific diagnosisId
                            // The ViewModel already loads diagnosisId if passed or we trigger update
                        }
                    }
                    ReferralScreen(
                        diagnosisId = diagId,
                        referralViewModel = referralVM,
                        onBackClick = { navController.popBackStack() }
                    )
                }

                // 11. Audit Trail Screen
                composable(Screen.AuditTrail.route) {
                    AuditTrailScreen(
                        auditViewModel = auditViewModel
                    )
                }

                // 12. ADR Screen
                composable(
                    route = Screen.ADR.route,
                    arguments = listOf(navArgument("diagnosisId") {
                        type = NavType.StringType
                        nullable = true
                        defaultValue = null
                    })
                ) { backStackEntry ->
                    val diagId = backStackEntry.arguments?.getString("diagnosisId")
                    val adrVM = remember(diagId) {
                        ADRViewModel(null, app.diagnosisRepository, app.logADREventUseCase)
                    }
                    ADRScreen(
                        adrViewModel = adrVM,
                        onBackClick = { navController.popBackStack() }
                    )
                }

                // 13. Settings Screen
                composable(Screen.Settings.route) {
                    val clinician by dashboardViewModel.currentClinician.collectAsState()
                    SettingsScreen(
                        clinician = clinician,
                        clinicianDataStore = app.clinicianDataStore,
                        onLogout = {
                            navController.navigate(Screen.Login.route) {
                                popUpTo(0) { inclusive = true }
                            }
                        }
                    )
                }
            }
        }
    }
}
