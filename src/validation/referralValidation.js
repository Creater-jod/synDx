function validateReferralMatch(body) {
  if (!body || typeof body !== 'object') {
    return { error: 'Request body must be an object with condition and is_emergency flag.' };
  }
  return null;
}

module.exports = {
  validateReferralMatch
};
