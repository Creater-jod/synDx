function validateCreateCase(body) {
  const { condition, tier, confidence } = body;
  if (!condition || typeof condition !== 'string' || !condition.trim()) {
    return { error: 'Case condition is required.' };
  }
  if (!tier || !['A', 'B', 'C'].includes(tier.toUpperCase())) {
    return { error: 'Invalid urgency tier. Must be A, B, or C.' };
  }
  if (confidence === undefined || confidence === null || isNaN(Number(confidence))) {
    return { error: 'Valid numeric confidence score (0-100) is required.' };
  }
  const confNum = Number(confidence);
  if (confNum < 0 || confNum > 100) {
    return { error: 'Confidence score must be between 0 and 100.' };
  }
  return null;
}

function validateCaseDecision(body) {
  const { status } = body;
  if (!status || !['confirmed', 'more-tests', 'overridden'].includes(status)) {
    return { error: 'Invalid status decision.' };
  }
  return null;
}

function validatePatientIntake(body) {
  if (!body || Object.keys(body).length === 0) {
    return { error: 'Patient intake payload cannot be empty.' };
  }
  return null;
}

module.exports = {
  validateCreateCase,
  validateCaseDecision,
  validatePatientIntake
};
