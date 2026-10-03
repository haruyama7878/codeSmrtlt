// Sinh secret cho deployment k3s: Postgres + Supabase Auth (GoTrue)
const crypto = require("crypto");

function randHex(bytes) {
  return crypto.randomBytes(bytes).toString("hex");
}

function b64url(obj) {
  return Buffer.from(JSON.stringify(obj)).toString("base64url");
}

function signJwt(payload, secret) {
  const header = { alg: "HS256", typ: "JWT" };
  const body = b64url(header) + "." + b64url(payload);
  const sig = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return body + "." + sig;
}

const dbPassword = randHex(24);
const jwtSecret = randHex(32);
const operatorToken = randHex(24);
const now = Math.floor(Date.now() / 1000);

const anonKey = signJwt(
  { iss: "supabase", role: "anon", iat: now, exp: now + 60 * 60 * 24 * 3650 },
  jwtSecret
);
const serviceRoleKey = signJwt(
  { iss: "supabase", role: "service_role", iat: now, exp: now + 60 * 60 * 24 * 3650 },
  jwtSecret
);

console.log("DB_PASSWORD=" + dbPassword);
console.log("JWT_SECRET=" + jwtSecret);
console.log("OPERATOR_TOKEN=" + operatorToken);
console.log("ANON_KEY=" + anonKey);
console.log("SERVICE_ROLE_KEY=" + serviceRoleKey);
