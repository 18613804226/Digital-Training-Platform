import { d as defineEventHandler, a as unAuthorizedResponse, k as sleep, b as useResponseSuccess } from '../../../../_/nitro.mjs';
import { v as verifyAccessToken } from '../../../../_/jwt-utils.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'jsonwebtoken';
import '../../../../_/mock-data.mjs';

const _id__delete = defineEventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }
  await sleep(1e3);
  return useResponseSuccess(null);
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map
