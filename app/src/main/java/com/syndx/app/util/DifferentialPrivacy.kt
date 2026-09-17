package com.syndx.app.util

import kotlin.math.abs
import kotlin.math.ln
import kotlin.math.sign

object DifferentialPrivacy {
    private const val EPSILON = 1.0

    /** Add Laplace noise to a confidence score before federated sync. */
    fun addLaplaceNoise(value: Float): Float {
        val scale = 1.0 / EPSILON
        val uniform = Math.random() - 0.5
        val noise = (-scale * sign(uniform.toFloat()) *
                ln(1.0 - 2.0 * abs(uniform))).toFloat()
        return (value + noise).coerceIn(0f, 1f)
    }
}
