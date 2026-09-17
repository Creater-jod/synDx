package com.syndx.app.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.syndx.app.domain.model.AuditLog
import com.syndx.app.domain.usecase.audit.SyncAuditToBlockchainUseCase
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

enum class AuditFilter {
    ALL, DIAGNOSES, REFERRALS, ADR
}

class AuditViewModel(
    private val syncAuditUseCase: SyncAuditToBlockchainUseCase
) : ViewModel() {

    private val _selectedFilter = MutableStateFlow(AuditFilter.ALL)
    val selectedFilter: StateFlow<AuditFilter> = _selectedFilter.asStateFlow()

    private val _isSyncing = MutableStateFlow(false)
    val isSyncing: StateFlow<Boolean> = _isSyncing.asStateFlow()

    val totalCount: StateFlow<Int> = syncAuditUseCase.getTotalCount()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val syncedCount: StateFlow<Int> = syncAuditUseCase.getSyncedCount()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val pendingCount: StateFlow<Int> = syncAuditUseCase.getPendingCount()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val filteredLogs: StateFlow<List<AuditLog>> = combine(
        syncAuditUseCase.getAllLogs(),
        _selectedFilter
    ) { logs, filter ->
        when (filter) {
            AuditFilter.ALL -> logs
            AuditFilter.DIAGNOSES -> logs.filter { it.eventType == "DIAGNOSIS_COMPLETED" }
            AuditFilter.REFERRALS -> logs.filter { it.eventType == "REFERRAL_ISSUED" }
            AuditFilter.ADR -> logs.filter { it.eventType == "ADR_REPORTED" }
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun selectFilter(filter: AuditFilter) {
        _selectedFilter.value = filter
    }

    fun syncPendingLogs() {
        if (_isSyncing.value) return
        viewModelScope.launch {
            _isSyncing.value = true
            syncAuditUseCase.syncPending()
            _isSyncing.value = false
        }
    }
}
