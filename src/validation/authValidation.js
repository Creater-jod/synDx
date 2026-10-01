function validateLogin(body) {
  const { username, password } = body;
  if (!username || typeof username !== 'string' || !username.trim()) {
    return { error: 'Username and password are required.' };
  }
  if (!password || typeof password !== 'string' || !password.trim()) {
    return { error: 'Username and password are required.' };
  }
  return null;
}

function validateRegister(body) {
  const { username, password, full_name, role } = body;
  if (!username || !password || !full_name || !role) {
    return { error: 'All fields are required.' };
  }
  if (typeof username !== 'string' || username.trim().length < 3) {
    return { error: 'Username must be at least 3 characters long.' };
  }
  if (typeof password !== 'string' || password.length < 6) {
    return { error: 'Password must be at least 6 characters long.' };
  }
  const validRoles = ['health_worker', 'doctor', 'clinic_admin', 'system_admin'];
  if (!validRoles.includes(role)) {
    return { error: `Invalid role. Allowed roles: ${validRoles.join(', ')}` };
  }
  return null;
}

module.exports = {
  validateLogin,
  validateRegister
};
