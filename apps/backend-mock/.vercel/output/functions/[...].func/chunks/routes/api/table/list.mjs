import { faker } from '@faker-js/faker';
import { d as defineEventHandler, a as unAuthorizedResponse, k as sleep, j as getQuery, l as usePageResponseSuccess } from '../../../_/nitro.mjs';
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

function generateMockDataList(count) {
  const dataList = [];
  for (let i = 0; i < count; i++) {
    const dataItem = {
      id: faker.string.uuid(),
      imageUrl: faker.image.avatar(),
      imageUrl2: faker.image.avatar(),
      open: faker.datatype.boolean(),
      status: faker.helpers.arrayElement(["success", "error", "warning"]),
      productName: faker.commerce.productName(),
      price: faker.commerce.price(),
      currency: faker.finance.currencyCode(),
      quantity: faker.number.int({ min: 1, max: 100 }),
      available: faker.datatype.boolean(),
      category: faker.commerce.department(),
      releaseDate: faker.date.past(),
      rating: faker.number.float({ min: 1, max: 5 }),
      description: faker.commerce.productDescription(),
      weight: faker.number.float({ min: 0.1, max: 10 }),
      color: faker.color.human(),
      inProduction: faker.datatype.boolean(),
      tags: Array.from({ length: 3 }, () => faker.commerce.productAdjective())
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
  await sleep(600);
  const { page, pageSize, sortBy, sortOrder } = getQuery(event);
  const pageRaw = Array.isArray(page) ? page[0] : page;
  const pageSizeRaw = Array.isArray(pageSize) ? pageSize[0] : pageSize;
  const pageNumber = Math.max(
    1,
    Number.parseInt(String(pageRaw != null ? pageRaw : "1"), 10) || 1
  );
  const pageSizeNumber = Math.min(
    100,
    Math.max(1, Number.parseInt(String(pageSizeRaw != null ? pageSizeRaw : "10"), 10) || 10)
  );
  const listData = structuredClone(mockData);
  const sortKeyRaw = Array.isArray(sortBy) ? sortBy[0] : sortBy;
  const sortOrderRaw = Array.isArray(sortOrder) ? sortOrder[0] : sortOrder;
  if (typeof sortKeyRaw === "string" && listData[0] && Object.prototype.hasOwnProperty.call(listData[0], sortKeyRaw)) {
    const sortKey = sortKeyRaw;
    const isDesc = sortOrderRaw === "desc";
    listData.sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      let result = 0;
      if (typeof aValue === "number" && typeof bValue === "number") {
        result = aValue - bValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        result = aValue.getTime() - bValue.getTime();
      } else if (typeof aValue === "boolean" && typeof bValue === "boolean") {
        if (aValue === bValue) {
          result = 0;
        } else {
          result = aValue ? 1 : -1;
        }
      } else {
        const aStr = String(aValue);
        const bStr = String(bValue);
        const aNum = Number(aStr);
        const bNum = Number(bStr);
        result = Number.isFinite(aNum) && Number.isFinite(bNum) ? aNum - bNum : aStr.localeCompare(bStr, void 0, {
          numeric: true,
          sensitivity: "base"
        });
      }
      return isDesc ? -result : result;
    });
  }
  return usePageResponseSuccess(
    String(pageNumber),
    String(pageSizeNumber),
    listData
  );
});

export { list as default };
//# sourceMappingURL=list.mjs.map
