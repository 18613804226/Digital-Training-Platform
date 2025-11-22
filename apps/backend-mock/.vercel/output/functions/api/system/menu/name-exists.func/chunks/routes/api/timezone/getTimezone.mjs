import { d as defineEventHandler, a as unAuthorizedResponse, b as useResponseSuccess } from '../../../_/nitro.mjs';
import { v as verifyAccessToken } from '../../../_/jwt-utils.mjs';
import { g as getTimezone$1 } from '../../../_/timezone-utils.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'jsonwebtoken';
import '../../../_/mock-data.mjs';

const getTimezone = defineEventHandler((event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }
  return useResponseSuccess(getTimezone$1());
});

export { getTimezone as default };
//# sourceMappingURL=getTimezone.mjs.map
