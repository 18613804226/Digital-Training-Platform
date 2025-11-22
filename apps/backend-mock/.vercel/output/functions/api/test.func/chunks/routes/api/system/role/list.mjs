import { faker } from '@faker-js/faker';
import { d as defineEventHandler, a as unAuthorizedResponse, j as getQuery, l as usePageResponseSuccess } from '../../../../_/nitro.mjs';
import { v as verifyAccessToken } from '../../../../_/jwt-utils.mjs';
import { g as getMenuIds, c as MOCK_MENU_LIST } from '../../../../_/mock-data.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'jsonwebtoken';

const formatterCN = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit"
});
const menuIds = getMenuIds(MOCK_MENU_LIST);
function generateMockDataList(count) {
  const dataList = [];
  for (let i = 0; i < count; i++) {
    const dataItem = {
      id: faker.string.uuid(),
      name: faker.commerce.product(),
      status: faker.helpers.arrayElement([0, 1]),
      createTime: formatterCN.format(
        faker.date.between({ from: "2022-01-01", to: "2025-01-01" })
      ),
      permissions: faker.helpers.arrayElements(menuIds),
      remark: faker.lorem.sentence()
    };
    dataList.push(dataItem);
  }
  return dataList;
}
const mockData = generateMockDataList(100);
const list = defineEventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }
  const {
    page = 1,
    pageSize = 20,
    name,
    id,
    remark,
    startTime,
    endTime,
    status
  } = getQuery(event);
  let listData = structuredClone(mockData);
  if (name) {
    listData = listData.filter(
      (item) => item.name.toLowerCase().includes(String(name).toLowerCase())
    );
  }
  if (id) {
    listData = listData.filter(
      (item) => item.id.toLowerCase().includes(String(id).toLowerCase())
    );
  }
  if (remark) {
    listData = listData.filter(
      (item) => {
        var _a, _b;
        return (_b = (_a = item.remark) == null ? void 0 : _a.toLowerCase()) == null ? void 0 : _b.includes(String(remark).toLowerCase());
      }
    );
  }
  if (startTime) {
    listData = listData.filter((item) => item.createTime >= startTime);
  }
  if (endTime) {
    listData = listData.filter((item) => item.createTime <= endTime);
  }
  if (["0", "1"].includes(status)) {
    listData = listData.filter((item) => item.status === Number(status));
  }
  return usePageResponseSuccess(page, pageSize, listData);
});

export { list as default };
//# sourceMappingURL=list.mjs.map
