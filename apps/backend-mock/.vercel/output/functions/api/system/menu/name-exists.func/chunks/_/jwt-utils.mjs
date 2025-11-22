import jwt from 'jsonwebtoken';
import { a as MOCK_USERS } from './mock-data.mjs';

const ACCESS_TOKEN_SECRET = "access_token_secret";
const REFRESH_TOKEN_SECRET = "refresh_token_secret";
function generateAccessToken(user) {
  return jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: "7d" });
}
function generateRefreshToken(user) {
  return jwt.sign(user, REFRESH_TOKEN_SECRET, {
    expiresIn: "30d"
  });
}
function verifyAccessToken(rawReq) {
  const headers = (rawReq == null ? void 0 : rawReq.headers) || {};
  const authHeader = headers.authorization || headers.Authorization;
  if (!(authHeader == null ? void 0 : authHeader.startsWith("Bearer "))) {
    return null;
  }
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    const user = MOCK_USERS.find((u) => u.username === decoded.username);
    if (!user) return null;
    const { password: _, ...userinfo } = user;
    return userinfo;
  } catch {
    return null;
  }
  if (!(authHeader == null ? void 0 : authHeader.startsWith("Bearer"))) {
    return null;
  }
  const tokenParts = authHeader.split(" ");
  if (tokenParts.length !== 2) {
    return null;
  }
  try {
    const decoded = jwt.verify(
      token,
      ACCESS_TOKEN_SECRET
    );
    const username = decoded.username;
    const user = MOCK_USERS.find((item) => item.username === username);
    if (!user) {
      return null;
    }
    const { password: _pwd, ...userinfo } = user;
    return userinfo;
  } catch {
    return null;
  }
}
function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);
    const username = decoded.username;
    const user = MOCK_USERS.find(
      (item) => item.username === username
    );
    if (!user) {
      return null;
    }
    const { password: _pwd, ...userinfo } = user;
    return userinfo;
  } catch {
    return null;
  }
}

export { generateRefreshToken as a, verifyRefreshToken as b, generateAccessToken as g, verifyAccessToken as v };
//# sourceMappingURL=jwt-utils.mjs.map
