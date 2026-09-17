package com.syndx.app.data.datastore

import android.content.Context
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "syndx_prefs")

data class ClinicianPrefs(
    val clinicianId: String?,
    val isLoggedIn: Boolean,
    val onboardingDone: Boolean,
    val language: String,
    val offlineOnlyMode: Boolean
)

class ClinicianDataStore(private val context: Context) {

    companion object {
        val CLINICIAN_ID_KEY = stringPreferencesKey("clinician_id")
        val IS_LOGGED_IN_KEY = booleanPreferencesKey("is_logged_in")
        val ONBOARDING_DONE_KEY = booleanPreferencesKey("onboarding_done")
        val LANGUAGE_KEY = stringPreferencesKey("language")
        val OFFLINE_ONLY_KEY = booleanPreferencesKey("offline_only")
    }

    val prefs: Flow<ClinicianPrefs> = context.dataStore.data.map { preferences ->
        ClinicianPrefs(
            clinicianId = preferences[CLINICIAN_ID_KEY],
            isLoggedIn = preferences[IS_LOGGED_IN_KEY] ?: false,
            onboardingDone = preferences[ONBOARDING_DONE_KEY] ?: false,
            language = preferences[LANGUAGE_KEY] ?: "EN",
            offlineOnlyMode = preferences[OFFLINE_ONLY_KEY] ?: false
        )
    }

    suspend fun saveLogin(clinicianId: String) {
        context.dataStore.edit { preferences ->
            preferences[CLINICIAN_ID_KEY] = clinicianId
            preferences[IS_LOGGED_IN_KEY] = true
        }
    }

    suspend fun setOnboardingDone(done: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[ONBOARDING_DONE_KEY] = done
        }
    }

    suspend fun setLanguage(language: String) {
        context.dataStore.edit { preferences ->
            preferences[LANGUAGE_KEY] = language
        }
    }

    suspend fun setOfflineOnly(offline: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[OFFLINE_ONLY_KEY] = offline
        }
    }

    suspend fun clearLogin() {
        context.dataStore.edit { preferences ->
            preferences[CLINICIAN_ID_KEY] = ""
            preferences[IS_LOGGED_IN_KEY] = false
        }
    }
}
