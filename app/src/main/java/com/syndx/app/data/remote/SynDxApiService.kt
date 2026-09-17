package com.syndx.app.data.remote

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

@JsonClass(generateAdapter = true)
data class ClinicalPredictionRequest(
    @Json(name = "features") val features: Map<String, Double>
)

@JsonClass(generateAdapter = true)
data class TopFeatureImpact(
    @Json(name = "feature") val feature: String,
    @Json(name = "value") val value: Double,
    @Json(name = "direction") val direction: String
)

@JsonClass(generateAdapter = true)
data class ClinicalPredictionResponse(
    @Json(name = "ensemble_probability") val ensembleProbability: Double,
    @Json(name = "xgboost_probability") val xgboostProbability: Double,
    @Json(name = "lightgbm_probability") val lightgbmProbability: Double,
    @Json(name = "random_forest_probability") val randomForestProbability: Double,
    @Json(name = "predicted_class") val predictedClass: Int,
    @Json(name = "predicted_phenotype") val predictedPhenotype: String,
    @Json(name = "risk_tier") val riskTier: String,
    @Json(name = "model_consensus") val modelConsensus: String,
    @Json(name = "top_contributing_features") val topFeatures: List<TopFeatureImpact> = emptyList(),
    @Json(name = "medical_disclaimer") val medicalDisclaimer: String = ""
)

interface SynDxApiService {

    @Suppress("unused")
    @GET("api/patients")
    suspend fun getRemotePatients(): Response<List<Map<String, Any>>>

    @Suppress("unused")
    @POST("api/audit/sync")
    suspend fun syncAuditLog(@Body payload: Map<String, Any>): Response<Map<String, Any>>

    @Suppress("unused")
    @GET("api/models/{version}")
    suspend fun getModelWeights(@Path("version") version: String): Response<Map<String, Any>>

    @POST("api/predict/clinical")
    suspend fun predictClinicalPhenotype(@Body request: ClinicalPredictionRequest): Response<ClinicalPredictionResponse>
}
