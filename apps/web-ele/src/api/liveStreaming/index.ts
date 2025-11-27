import { requestClient } from '#/api/request';

/**
 * 调用视频// get-url
 */
export async function getUserSigApi(params: any) {
  return requestClient.get<any>('/tencentRtc/get-user-sig', { params });
}
