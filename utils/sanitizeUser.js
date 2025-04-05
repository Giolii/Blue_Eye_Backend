const sanitizeUser = (user) => {
  if (!user) return null;

  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
};
const userFields = {
  id: true,
  email: true,
  username: true,
  name: true,
  avatar: true,
  createdAt: true,
};

module.exports = { sanitizeUser, userFields };
