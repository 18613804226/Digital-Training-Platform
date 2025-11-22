import { d as defineEventHandler, a as unAuthorizedResponse, b as useResponseSuccess } from '../../../_/nitro.mjs';
import { v as verifyAccessToken } from '../../../_/jwt-utils.mjs';
import { b as MOCK_MENUS } from '../../../_/mock-data.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'jsonwebtoken';

const all = defineEventHandler(async (event) => {
  var _a, _b;
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }
  const menus = (_b = (_a = MOCK_MENUS.find((item) => item.username === userinfo.username)) == null ? void 0 : _a.menus) != null ? _b : [];
  return useResponseSuccess(menus);
});

export { all as default };
//# sourceMappingURL=all.mjs.map
