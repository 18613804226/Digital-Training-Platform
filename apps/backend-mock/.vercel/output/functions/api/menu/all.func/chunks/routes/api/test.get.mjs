import { d as defineEventHandler } from '../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const test_get = defineEventHandler(() => "Test get handler");

export { test_get as default };
//# sourceMappingURL=test.get.mjs.map
