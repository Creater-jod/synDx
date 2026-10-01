function validateEmergencyEvaluation(body) {
  if (!body || typeof body !== 'object') {
    return { error: 'Request body must be an object containing clinical vital parameters.' };
  }
  return null;
}

module.exports = {
  validateEmergencyEvaluation
};
