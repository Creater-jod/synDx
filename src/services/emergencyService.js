class EmergencyService {
  evaluateVitals({ spo2, hr, bp, temp }) {
    const triggers = [];
    let is_emergency = false;

    const numSpo2 = Number(spo2);
    const numHr = Number(hr);
    const numTemp = Number(temp);

    // 1. Oxygen Saturation Threshold (<90% Critical Hypoxia)
    if (!isNaN(numSpo2) && numSpo2 > 0) {
      if (numSpo2 < 90) {
        triggers.push(`Critical Hypoxia: SpO2 ${numSpo2}% is dangerously below the 90% threshold.`);
        is_emergency = true;
      }
    }

    // 2. Heart Rate Threshold (>140 Tachycardia, <45 Bradycardia)
    if (!isNaN(numHr) && numHr > 0) {
      if (numHr > 140) {
        triggers.push(`Severe Tachycardia: Heart rate ${numHr} bpm exceeds 140 bpm critical limit.`);
        is_emergency = true;
      } else if (numHr < 45) {
        triggers.push(`Severe Bradycardia: Heart rate ${numHr} bpm is below 45 bpm critical limit.`);
        is_emergency = true;
      }
    }

    // 3. Blood Pressure Evaluation (Systolic >= 180 or < 80, Diastolic >= 120)
    if (bp && typeof bp === 'string') {
      const parts = bp.split('/');
      if (parts.length === 2) {
        const sys = parseInt(parts[0], 10);
        const dia = parseInt(parts[1], 10);
        if (sys >= 180 || dia >= 120) {
          triggers.push(`Hypertensive Crisis: BP ${bp} exceeds 180/120 mmHg emergency threshold.`);
          is_emergency = true;
        } else if (sys < 80) {
          triggers.push(`Hypotensive Shock Pattern: Systolic BP ${sys} mmHg is below 80 mmHg.`);
          is_emergency = true;
        }
      }
    }

    // 4. Core Body Temperature (Hyperpyrexia >=39.5°C, Hypothermia <=35.0°C)
    if (!isNaN(numTemp) && numTemp > 0) {
      if (numTemp >= 39.5) {
        triggers.push(`Critical Hyperpyrexia: Temperature ${numTemp}°C >= 39.5°C threshold.`);
        is_emergency = true;
      } else if (numTemp <= 35.0) {
        triggers.push(`Critical Hypothermia: Temperature ${numTemp}°C <= 35.0°C threshold.`);
        is_emergency = true;
      }
    }

    return {
      is_emergency,
      recommended_tier: is_emergency ? 'A' : 'B',
      triggers,
      protocol: is_emergency
        ? 'EMERGENCY PROTOCOL ACTIVATED: Immediate physician page, supplemental high-flow O2, vascular access, and priority routing to Level 1 Emergency & Trauma Unit.'
        : 'Standard Clinical Evaluation Protocol: Proceed with routine diagnostic review.'
    };
  }
}

module.exports = new EmergencyService();
