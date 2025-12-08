// certificate
import { requestClient } from '#/api/request';

/**
 * 调用视频// get-url
 */
export async function getCourseApi(params: any) {
  return requestClient.get<any>('/courses', { params });
}
export async function getCourseByIdApi(params: any) {
  return requestClient.get<any>(`/courses/${params.courseId}`);
}
export async function createCourseApi(data: any) {
  return requestClient.post<any>('/courses', data);
}
export async function putCourseApi(data: any) {
  return requestClient.put<any>(`/courses/${data.id}`, data);
}
export async function deleteCourseApi(data: any) {
  return requestClient.delete<any>(`/courses/${data}`);
}
export async function createLessonApi(data: any) {
  return requestClient.post<any>(`/courses/${data.courseId}/lessons`, data);
}

interface UpdateLessonRequest {
  lessonId: number;
  title?: string;
  description?: string;
}
export async function updateLessonApi(data: UpdateLessonRequest) {
  return requestClient.patch<any>(`/courses/lessons/${data.lessonId}`, data);
}
export async function deleteLessonApi(data: any) {
  return requestClient.delete<any>(`/courses/lessons/${data.lessonId}`);
}
export async function getLessonApi(data: any) {
  return requestClient.get<any>(`/courses/lessons/${data.lessonId}`);
}
// :courseId/reorder-lessons
export async function updateLessonsOrderApi(data: any) {
  return requestClient.post<any>(
    `/courses/${data.courseId}/reorder-lessons`,
    data,
  );
}
// :courseId/lessons/:lessonId/complete
export async function updateCompleteApi(data: any) {
  return requestClient.post<any>(
    `/courses/${data.courseId}/lessons/${data.lessonId}/complete`,
    data,
  );
}
export async function updateUncompleteApi(data: any) {
  return requestClient.post<any>(
    `/courses/${data.courseId}/lessons/${data.lessonId}/uncomplete`,
    data,
  );
}
