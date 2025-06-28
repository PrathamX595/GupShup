import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import { Strategy as MagicLinkStrategy } from "passport-magic-link";   //will need to check for typescript type deffinitions
import { User } from "../models/User";
import ErrorResponse from "../utils/errorResponse";

const passportConfig = () => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new ErrorResponse(
      500,
      "Google OAuth credentials not found in environment variables"
    );
  }

  passport.serializeUser((user: any, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email });

          if (!user) {
            return done(504, false, { message: "invalid email or password" });
          }

          const isMatch = await user.isPasswordCorrect(password);

          if (!isMatch) {
            return done(null, false, { message: "Invalid email or password" });
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        callbackURL: "http://localhost:5000/api/auth/google/callback",
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ email: profile.emails?.[0].value });

          if (user) {
            return done(null, user);
          }

          user = await User.create({
            email: profile.emails?.[0].value,
            userName: profile.displayName,
            password: Math.random().toString(36).slice(-8),
            avatar: profile.photos?.[0].value,
          });

          const accessToken = user.generateAccessToken();
          const refreshToken = user.generateRefreshToken();
          user.refreshToken = refreshToken;

          await user.save({ validateBeforeSave: false });

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};

export default passportConfig;
