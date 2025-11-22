import { d as defineEventHandler, a as unAuthorizedResponse, b as useResponseSuccess } from '../../../_/nitro.mjs';
import { v as verifyAccessToken } from '../../../_/jwt-utils.mjs';
import { M as MOCK_CODES } from '../../../_/mock-data.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'jsonwebtoken';

const codes = defineEventHandler((event) => {
  var _a, _b;
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }
  const codes = (_b = (_a = MOCK_CODES.find((item) => item.username === userinfo.username)) == null ? void 0 : _a.codes) != null ? _b : [];
  return useResponseSuccess(codes);
});

export { codes as default };
//# sourceMappingURL=codes.mjs.map
