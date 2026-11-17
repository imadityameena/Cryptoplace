import { OAuth2Client } from "google-auth-library";
import env from "../config/env.js";
import ApiError from "../utils/ApiError.js";

const client = new OAuth2Client();

const googleAuth = {
  isConfigured: () => Boolean(env.googleClientId),

  /**
   * Verifies a Google ID token and returns the verified profile.
   */
  async verifyIdToken(idToken) {
    let payload;
    try {
      const ticket = await client.verifyIdToken({ idToken, audience: env.googleClientId });
      payload = ticket.getPayload();
    } catch {
      throw ApiError.unauthorized("Google sign-in failed, please try again");
    }

    if (!payload?.email || !payload.email_verified) {
      throw ApiError.unauthorized("Your Google email address is not verified");
    }

    return {
      googleId: payload.sub,
      email: payload.email.toLowerCase(),
      name: payload.name || payload.email.split("@")[0],
      avatar: payload.picture,
    };
  },
};

export default googleAuth;
