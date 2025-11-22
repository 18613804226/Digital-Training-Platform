import { faker } from '@faker-js/faker';
import { d as defineEventHandler, a as unAuthorizedResponse, b as useResponseSuccess } from '../../../../_/nitro.mjs';
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

const formatterCN = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit"
});
function generateMockDataList(count) {
  const dataList = [];
  for (let i = 0; i < count; i++) {
    const dataItem = {
      id: faker.string.uuid(),
      pid: 0,
      name: faker.commerce.department(),
      status: faker.helpers.arrayElement([0, 1]),
      createTime: formatterCN.format(
        faker.date.between({ from: "2021-01-01", to: "2022-12-31" })
      ),
      remark: faker.lorem.sentence()
    };
    if (faker.datatype.boolean()) {
      dataItem.children = Array.from(
        { length: faker.number.int({ min: 1, max: 5 }) },
        () => ({
          id: faker.string.uuid(),
          pid: dataItem.id,
          name: faker.commerce.department(),
          status: faker.helpers.arrayElement([0, 1]),
          createTime: formatterCN.format(
            faker.date.between({ from: "2023-01-01", to: "2023-12-31" })
          ),
          remark: faker.lorem.sentence()
        })
      );
    }
    dataList.push(dataItem);
  }
  return dataList;
}
const mockData = generateMockDataList(10);
const list = defineEventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }
  const listData = structuredClone(mockData);
  return useResponseSuccess(listData);
});

export { list as default };
//# sourceMappingURL=list.mjs.map
