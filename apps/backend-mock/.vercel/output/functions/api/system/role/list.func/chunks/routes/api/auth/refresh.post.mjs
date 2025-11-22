import { d as defineEventHandler, f as forbiddenResponse } from '../../../_/nitro.mjs';
import { g as getRefreshTokenFromCookie, c as clearRefreshTokenCookie, s as setRefreshTokenCookie } from '../../../_/cookie-utils.mjs';
import { b as verifyRefreshToken, g as generateAccessToken } from '../../../_/jwt-utils.mjs';
import { a as MOCK_USERS } from '../../../_/mock-data.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'jsonwebtoken';

const refresh_post = defineEventHandler(async (event) => {
  const refreshToken = getRefreshTokenFromCookie(event);
  if (!refreshToken) {
    return forbiddenResponse(event);
  }
  clearRefreshTokenCookie(event);
  const userinfo = verifyRefreshToken(refreshToken);
  if (!userinfo) {
    return forbiddenResponse(event);
  }
  const findUser = MOCK_USERS.find(
    (item) => item.username === userinfo.username
  );
  if (!findUser) {
    return forbiddenResponse(event);
  }
  const accessToken = generateAccessToken(findUser);
  setRefreshTokenCookie(event, refreshToken);
  return accessToken;
});

export { refresh_post as default };
//# sourceMappingURL=refresh.post.mjs.map
