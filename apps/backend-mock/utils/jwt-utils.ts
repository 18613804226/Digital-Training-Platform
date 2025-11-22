import type { EventHandlerRequest, H3Event } from 'h3';

import type { UserInfo } from './mock-data';

import { getHeader } from 'h3';
import jwt from 'jsonwebtoken';

import { MOCK_USERS } from './mock-data';

// TODO: Replace with your own secret key
const ACCESS_TOKEN_SECRET = 'access_token_secret';
const REFRESH_TOKEN_SECRET = 'refresh_token_secret';

export interface UserPayload extends UserInfo {
  iat: number;
  exp: number;
}
export function generateAccessToken(user: UserInfo) {
  return jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
}

export function generateRefreshToken(user: UserInfo) {
  return jwt.sign(user, REFRESH_TOKEN_SECRET, {
    expiresIn: '30d',
  });
}

function getAuthHeader(event: H3Event): string | undefined {
  try {
    return getHeader(event, 'authorization');
  } catch (e) {
    // fallback: 手动检查
    if ('request' in event) {
      const req = event as unknown as { request: Request };
      return req.request.headers.get('authorization') || undefined;
    }
    if (event.node?.req?.headers) {
      return event.node.req.headers.authorization;
    }
    return undefined;
  }
}

export function verifyAccessToken(
  event: H3Event<EventHandlerRequest>,
): null | Omit<UserInfo, 'password'> {
  console.log('🔍 event type:', typeof event);
  console.log('🔍 event.req exists:', !!event.req);

  // ✅ 直接使用 h3 的 getHeader —— 它内部已处理 Edge / Node.js 差异
  const authHeader = getHeader(event, 'authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7); // "Bearer xxx" → "xxx"

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as unknown as UserPayload;
    const user = MOCK_USERS.find(u => u.username === decoded.username);
    if (!user) return null;
    const { password: _, ...userinfo } = user;
    return userinfo;
  } catch {
    return null;
  }
  // const authHeader = getHeader(event, 'Authorization');
  if (!authHeader?.startsWith('Bearer')) {
    return null;
  }

  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2) {
    return null;
  }
  // const token = tokenParts[1] as string;
  try {
    const decoded = jwt.verify(
      token,
      ACCESS_TOKEN_SECRET,
    ) as unknown as UserPayload;

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

export function verifyRefreshToken(
  token: string,
): null | Omit<UserInfo, 'password'> {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as UserPayload;
    const username = decoded.username;
    const user = MOCK_USERS.find(
      (item) => item.username === username,
    ) as UserInfo;
    if (!user) {
      return null;
    }
    const { password: _pwd, ...userinfo } = user;
    return userinfo;
  } catch {
    return null;
  }
}
