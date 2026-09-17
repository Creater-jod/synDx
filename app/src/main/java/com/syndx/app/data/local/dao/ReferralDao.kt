package com.syndx.app.data.local.dao

import androidx.room.*
import com.syndx.app.data.local.entity.ReferralEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface ReferralDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(referral: ReferralEntity)

    @Update
    suspend fun update(referral: ReferralEntity)

    @Delete
    suspend fun delete(referral: ReferralEntity)

    @Query("SELECT * FROM referrals ORDER BY issuedAt DESC")
    fun getAll(): Flow<List<ReferralEntity>>

    @Query("SELECT * FROM referrals WHERE id = :id")
    suspend fun getById(id: String): ReferralEntity?

    @Query("SELECT * FROM referrals WHERE patientId = :patientId")
    fun getByPatientId(patientId: String): Flow<List<ReferralEntity>>

    @Query("SELECT * FROM referrals WHERE diagnosisId = :diagnosisId LIMIT 1")
    suspend fun getByDiagnosisId(diagnosisId: String): ReferralEntity?
}
