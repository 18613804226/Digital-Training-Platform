import { d as defineEventHandler, a as unAuthorizedResponse, i as setHeader } from '../../../_/nitro.mjs';
import { v as verifyAccessToken } from '../../../_/jwt-utils.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'jsonwebtoken';
import '../../../_/mock-data.mjs';

const bigint = defineEventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }
  const data = `
  {
    "code": 0,
    "message": "success",
    "data": [
              {
                "id": 123456789012345678901234567890123456789012345678901234567890,
                "name": "John Doe",
                "age": 30,
                "email": "john-doe@demo.com"
                },
                {
                "id": 987654321098765432109876543210987654321098765432109876543210,
                "name": "Jane Smith",
                "age": 25,
                "email": "jane@demo.com"
                }
            ]
  }
  `;
  setHeader(event, "Content-Type", "application/json");
  return data;
});

export { bigint as default };
//# sourceMappingURL=bigint.mjs.map
