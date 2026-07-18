export interface DummyUser {
  name: string;
  email: string;
}

const base64UrlEncode = (value: unknown) =>
  btoa(JSON.stringify(value))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

// Builds a JWT-shaped (but unsigned) token so the existing jwt-decode based
// AuthGuard/consumers can read it the same way a real backend token would be read.
export function createFakeToken(user: DummyUser, expiresInSeconds = 60 * 60 * 24 * 7) {
  const header = { alg: "none", typ: "JWT" };
  const payload = {
    ...user,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresInSeconds,
  };

  return `${base64UrlEncode(header)}.${base64UrlEncode(payload)}.dummy-signature`;
}
