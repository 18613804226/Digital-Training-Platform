import { defineEventHandler, getQuery, setResponseStatus } from 'h3';
import { useResponseError } from '../utils/response';

export default defineEventHandler((event) => {
  const { status } = getQuery(event);
  setResponseStatus(event, Number(status));
  return useResponseError(`${status}`);
});
