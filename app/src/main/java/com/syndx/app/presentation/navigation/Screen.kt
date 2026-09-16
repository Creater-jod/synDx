package com.syndx.app.presentation.navigation

sealed class Screen(val route: String) {
    object Splash : Screen("splash")
    object Onboarding : Screen("onboarding")
    object Login : Screen("login")
    object SignUp : Screen("signup")
    object Dashboard : Screen("dashboard")
    object PatientList : Screen("patient_list")
    object PatientRegister : Screen("patient_register")
    object SymptomInput : Screen("symptom_input/{patientId}") {
        fun createRoute(patientId: String) = "symptom_input/$patientId"
    }
    object Diagnosis : Screen("diagnosis/{sessionId}") {
        fun createRoute(sessionId: String) = "diagnosis/$sessionId"
    }
    object Referral : Screen("referral/{diagnosisId}") {
        fun createRoute(diagnosisId: String) = "referral/$diagnosisId"
    }
    object AuditTrail : Screen("audit_trail")
    object ADR : Screen("adr?diagnosisId={diagnosisId}") {
        fun createRoute(diagnosisId: String? = null) = if (diagnosisId != null) "adr?diagnosisId=$diagnosisId" else "adr"
    }
    object Settings : Screen("settings")
}
