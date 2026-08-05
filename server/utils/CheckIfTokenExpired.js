export const tokenExpired = (expiresAt) => {
  const now = new Date();
  const expires = new Date(expiresAt);
  return now > expires;
};
