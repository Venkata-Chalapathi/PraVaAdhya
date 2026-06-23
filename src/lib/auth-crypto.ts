const JWT_SECRET = process.env.JWT_SECRET || "letoile-pravadhya-secret-key-32-chars-long";

// base64url encoder utility
function base64urlEncode(str: string): string {
  const binary = new TextEncoder().encode(str);
  let base64 = "";
  const bytes = new Uint8Array(binary);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    base64 += String.fromCharCode(bytes[i]);
  }
  return btoa(base64)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

// base64url decoder utility
function base64urlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

// Signs a payload into a JWT token using HS256 HMAC-SHA256
export async function signJWT(payload: any, expiresInSeconds = 86400): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload = { ...payload, exp };
  
  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const encodedPayload = base64urlEncode(JSON.stringify(fullPayload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;
  
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(dataToSign)
  );
  
  // Convert signature Buffer to base64url
  const sigBytes = new Uint8Array(signature);
  let sigStr = "";
  for (let i = 0; i < sigBytes.byteLength; i++) {
    sigStr += String.fromCharCode(sigBytes[i]);
  }
  const encodedSignature = btoa(sigStr)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  
  return `${dataToSign}.${encodedSignature}`;
}

// Verifies a JWT token signature and expiry, returning decoded payload or null
export async function verifyJWT(token: string): Promise<any> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const dataToVerify = `${encodedHeader}.${encodedPayload}`;
    
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    
    // Decode base64url signature back to binary
    const sigBase64 = encodedSignature.replace(/-/g, "+").replace(/_/g, "/");
    const sigStr = atob(sigBase64);
    const sigBuf = new Uint8Array(sigStr.length);
    for (let i = 0; i < sigStr.length; i++) {
      sigBuf[i] = sigStr.charCodeAt(i);
    }
    
    const verified = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBuf,
      encoder.encode(dataToVerify)
    );
    
    if (!verified) return null;
    
    const payloadStr = base64urlDecode(encodedPayload);
    const payload = JSON.parse(payloadStr);
    
    // Validate expiry
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null;
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}

// Security: Access Token (15 minutes)
export async function signAccessToken(payload: any): Promise<string> {
  return signJWT(payload, 900); // 15 mins
}

// Security: Refresh Token (7 days)
export async function signRefreshToken(payload: any): Promise<string> {
  return signJWT(payload, 604800); // 7 days
}

// Security: Password Strength Validation Helper
export function validatePasswordStrength(password: string): { isValid: boolean; error?: string } {
  if (password.length < 8) {
    return { isValid: false, error: "Password must be at least 8 characters long." };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one uppercase letter." };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one lowercase letter." };
  }
  if (!/\d/.test(password)) {
    return { isValid: false, error: "Password must contain at least one number." };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one special character." };
  }
  return { isValid: true };
}
