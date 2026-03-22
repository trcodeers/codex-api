export default () => ({
  port: parseInt(process.env.PORT ?? '4000', 10),
  mongo: {
    uri: process.env.MONGO_URI,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '10', 10),
  },
  session: {
    secret: process.env.SESSION_SECRET,
    cookieName: process.env.SESSION_COOKIE_NAME ?? 'mockprep.sid',
    maxAge: parseInt(process.env.SESSION_COOKIE_MAX_AGE ?? '604800000', 10),
    secure: process.env.SESSION_COOKIE_SECURE === 'true',
    sameSite: process.env.SESSION_COOKIE_SAME_SITE ?? 'lax',
  },
});
