function validatePredictClinical(body) {
  if (!body || typeof body !== 'object') {
    return { error: 'Request body must be a valid JSON object.' };
  }

  if (!body.features || typeof body.features !== 'object' || Array.isArray(body.features)) {
    return { error: 'Invalid payload: features must be a non-empty object.' };
  }

  const keys = Object.keys(body.features);
  if (keys.length === 0) {
    return { error: 'Invalid payload: features object cannot be empty.' };
  }

  for (const k of keys) {
    const val = body.features[k];
    if (val === null || val === undefined || (typeof val === 'number' && !Number.isFinite(val))) {
      return { error: `Invalid feature value for '${k}': must be a finite numerical value.` };
    }
    const num = Number(val);
    if (Number.isNaN(num)) {
      return { error: `Feature '${k}' must be numeric, received '${val}'.` };
    }
  }

  const f = body.features;

  if (f.Age !== undefined) {
    const age = Number(f.Age);
    if (age < 0 || age > 120) {
      return { error: `Physiological violation: Age must be between 0 and 120 years, received ${age}.` };
    }
  }

  if (f.Gender !== undefined) {
    const g = Number(f.Gender);
    if (![-1, 0, 1].includes(g)) {
      return { error: `Gender must be encoded as 1 (Male), -1 (Female), or 0 (Unspecified). Received: ${g}` };
    }
  }

  if (f['24-hour urine copper'] !== undefined && Number(f['24-hour urine copper']) < 0) {
    return { error: '24-hour urine copper excretion cannot be negative.' };
  }

  if (f.CP !== undefined && Number(f.CP) < 0) {
    return { error: 'Serum ceruloplasmin (CP) cannot be negative.' };
  }

  if (f['Psychiatric symptom score'] !== undefined) {
    const s = Number(f['Psychiatric symptom score']);
    if (s < 0 || s > 10) {
      return { error: `Psychiatric symptom score must be between 0.0 and 10.0, received ${s}.` };
    }
  }

  if (f['Liver symptom score'] !== undefined) {
    const s = Number(f['Liver symptom score']);
    if (s < 0 || s > 10) {
      return { error: `Liver symptom score must be between 0.0 and 10.0, received ${s}.` };
    }
  }

  return { valid: true };
}

module.exports = {
  validatePredictClinical
};
