package com.syndx.app.data.worker

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.syndx.app.data.blockchain.PolygonAuditLogger
import com.syndx.app.data.local.SynDxDatabase
import kotlinx.coroutines.flow.first

class SyncAuditWorker(ctx: Context, params: WorkerParameters) : CoroutineWorker(ctx, params) {
    override suspend fun doWork(): Result {
        return try {
            val db = SynDxDatabase.build(applicationContext)
            val pending = db.auditLogDao().getPendingSync().first()
            pending.forEach { entry ->
                val updated = PolygonAuditLogger.attemptPolygonSync(entry)
                db.auditLogDao().update(updated)
            }
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }
}
