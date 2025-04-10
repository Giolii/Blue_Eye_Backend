const passport = require("passport");
const { Strategy: JwtStrategy } = require("passport-jwt");
const { sanitizeUser } = require("../utils/sanitizeUser");

const prisma = require("./prisma");

const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies.jwt;
  }
  return token;
};

const options = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  new JwtStrategy(options, async (jwt_payload, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: jwt_payload.id,
        },
      });
      if (user) {
        return done(null, sanitizeUser(user));
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);

module.exports = { passport };
