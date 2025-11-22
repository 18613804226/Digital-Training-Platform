import { d as defineEventHandler, r as readBody, s as setResponseStatus, c as useResponseError, f as forbiddenResponse, b as useResponseSuccess } from '../../../_/nitro.mjs';
import { c as clearRefreshTokenCookie, s as setRefreshTokenCookie } from '../../../_/cookie-utils.mjs';
import { g as generateAccessToken, a as generateRefreshToken } from '../../../_/jwt-utils.mjs';
import { a as MOCK_USERS } from '../../../_/mock-data.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'jsonwebtoken';

const login_post = defineEventHandler(async (event) => {
  const { password, username } = await readBody(event);
  if (!password || !username) {
    setResponseStatus(event, 400);
    return useResponseError(
      "BadRequestException",
      "Username and password are required"
    );
  }
  const findUser = MOCK_USERS.find(
    (item) => item.username === username && item.password === password
  );
  if (!findUser) {
    clearRefreshTokenCookie(event);
    return forbiddenResponse(event, "Username or password is incorrect.");
  }
  const accessToken = generateAccessToken(findUser);
  const refreshToken = generateRefreshToken(findUser);
  setRefreshTokenCookie(event, refreshToken);
  return useResponseSuccess({
    ...findUser,
    accessToken
  });
});

export { login_post as default };
//# sourceMappingURL=login.post.mjs.map
