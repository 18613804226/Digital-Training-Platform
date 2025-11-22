import { d as defineEventHandler, a as unAuthorizedResponse, j as getQuery, b as useResponseSuccess } from '../../../../_/nitro.mjs';
import { v as verifyAccessToken } from '../../../../_/jwt-utils.mjs';
import { c as MOCK_MENU_LIST } from '../../../../_/mock-data.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'jsonwebtoken';

const pathMap = { "/": 0 };
function getPaths(menus) {
  menus.forEach((menu) => {
    pathMap[menu.path] = String(menu.id);
    if (menu.children) {
      getPaths(menu.children);
    }
  });
}
getPaths(MOCK_MENU_LIST);
const pathExists = defineEventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }
  const { id, path } = getQuery(event);
  return path in pathMap && (!id || pathMap[path] !== String(id)) ? useResponseSuccess(true) : useResponseSuccess(false);
});

export { pathExists as default };
//# sourceMappingURL=path-exists.mjs.map
