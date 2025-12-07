// certificate
import { requestClient } from '#/api/request';

/**
 * 调用视频// get-url
 */
export async function getCourseApi(params: any) {
  return requestClient.get<any>('/courses', { params });
}
export async function getCourseByIdApi(params: any) {
  return requestClient.get<any>('/courses/' + params.courseId);
}
export async function createCourseApi(data: any) {
  return requestClient.post<any>('/courses', data);
}
export async function putCourseApi(data: any) {
  return requestClient.put<any>('/courses/' + data.id, data);
}
export async function deleteCourseApi(data: any) {
  return requestClient.delete<any>('/courses/' + data);
}
