import { requestClient } from '#/api/request';

/**
 * 调用视频// get-url
 */
export async function getVideoApi(data: any) {
  return requestClient.post<any>('/video/get-url', data);
}
