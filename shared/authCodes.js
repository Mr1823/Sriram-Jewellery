/**
 * Machine-readable auth response codes, shared by the Express API and the React
 * client. Imported by both — deliberately outside `src/` and `server/` so
 * neither owns it and neither can drift from the other.
 *
 * Why this matters more than it looks: the client's silent-refresh interceptor
 * retries a request only when a 401 body carries exactly `TOKEN_EXPIRED`. Any
 * other 401 signs the customer out immediately. So a typo in that string, or a
 * new route that rejects an expired token without setting the code, does not
 * fail loudly — it logs people out mid-checkout and looks like a flaky session.
 *
 * The server has exactly one place that verifies a token (`verifyJWT`), and it
 * is the only thing that should emit TOKEN_EXPIRED. New routes must use that
 * middleware rather than verifying a JWT themselves.
 */

export const AUTH_CODES = {
  /** Access token is well-formed but past its expiry. The client should
   *  refresh and retry, NOT sign the user out. */
  TOKEN_EXPIRED: "TOKEN_EXPIRED",

  /** Token is malformed, tampered with, or signed by another secret.
   *  Not recoverable by refreshing — the session is over. */
  TOKEN_INVALID: "TOKEN_INVALID",

  /** No Authorization header at all. */
  TOKEN_MISSING: "TOKEN_MISSING",

  /** Authenticated, but lacking the role this route requires. */
  FORBIDDEN_ROLE: "FORBIDDEN_ROLE",

  /** JWT_SECRET is unset on the server — auth cannot function. */
  AUTH_UNCONFIGURED: "AUTH_UNCONFIGURED",
};

export default AUTH_CODES;
