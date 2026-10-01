function validateSync(body) {
  if (!body || !Array.isArray(body.items)) {
    return { error: 'Invalid sync payload. Expected array of items.' };
  }
  return null;
}

module.exports = {
  validateSync
};
