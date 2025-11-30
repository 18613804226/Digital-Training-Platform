// certificate
import { requestClient } from '#/api/request';

/**
 * 调用视频// get-url
 */
export async function getCourseApi(params: any) {
  return requestClient.get<any>('/courses', { params });
}
export async function createCourseApi(data: any) {
  return requestClient.post<any>('/courses', data);
}
