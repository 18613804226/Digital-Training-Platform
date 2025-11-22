import { d as defineEventHandler, j as getQuery, s as setResponseStatus, c as useResponseError } from '../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const status = defineEventHandler((event) => {
  const { status } = getQuery(event);
  setResponseStatus(event, Number(status));
  return useResponseError(`${status}`);
});

export { status as default };
//# sourceMappingURL=status.mjs.map
