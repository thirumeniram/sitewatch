import { JwtVerifier } from "aws-jwt-verify";
import { config } from "../../config/config";
import {
  SUPABASE_AUTH_PATH,
  SUPABASE_JWKS_PATH,
  SUPABASE_TOKEN_AUDIENCE,
} from "../../shared/constants";

function createTokenVerifier() {
  return JwtVerifier.create({
    issuer: `${config.supabase.url}${SUPABASE_AUTH_PATH}`,
    audience: SUPABASE_TOKEN_AUDIENCE,
    jwksUri: `${config.supabase.url}${SUPABASE_JWKS_PATH}`,
  });
}

let verifier: ReturnType<typeof createTokenVerifier> | null = null;

export function getTokenVerifier(): ReturnType<typeof createTokenVerifier> {
  if (verifier) {
    return verifier;
  }
  verifier = createTokenVerifier();
  return verifier;
}
