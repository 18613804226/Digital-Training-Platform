import { defineEventHandler } from 'h3';
import { verifyAccessToken } from '../../utils/jwt-utils';
import { unAuthorizedResponse, useResponseSuccess } from '../../utils/response';
import { getTimezone } from '../../utils/timezone-utils';

export default defineEventHandler((event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }
  return useResponseSuccess(getTimezone());
});
