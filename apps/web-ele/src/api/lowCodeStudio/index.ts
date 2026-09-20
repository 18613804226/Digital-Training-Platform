import { requestClient } from '#/api/request';

/**
 * 调用视频// get-url
 */
export async function getExamTemplateApi() {
  return requestClient.get<any>('/exam-templates');
}
export async function postExamTemplateApi(data: any) {
  return requestClient.post<any>('/exam-templates', data);
}
export async function deleteExamTemplateApi(data: any) {
  return requestClient.delete<any>(`/exam-templates/${data}`);
}
export async function putExamTemplateApi(data: any) {
  return requestClient.put<any>(`/exam-templates/${data.id}`, data);
}
