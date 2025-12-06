import { requestClient } from '#/api/request';

// export namespace AuthApi {
//   /** 登录接口参数 */
//   export interface LoginParams {
//     password?: string;
//     username?: string;
//   }

//   /** 登录接口返回值 */
//   export interface LoginResult {
//     accessToken: string;
//   }

//   export interface RefreshTokenResult {
//     data: string;
//     status: number;
//   }
// }

/**
 * 调用通义千问
 */
export async function aiGenerateQuestionsApi(data: any) {
  return requestClient.post<any>('/ai-exam/generate-questions', data);
}
export async function aiReviewQuestionsApi(data: any) {
  return requestClient.post<any>('/ai-exam/review-questions', data);
}
/**
 * publish
 */
export async function publishExamApi(data: any) {
  return requestClient.post<any>('/ai-exam/publish', data);
}
/**
 *  get publish
 */
export async function getExamApi() {
  return requestClient.get<any>('/ai-exam/current');
}
// judge
export async function judgeExamApi(data: any) {
  return requestClient.post<any>('/ai-exam/judge', data);
}
// submit
export async function submitExamApi(data: any) {
  return requestClient.post<any>('/ai-exam/submit', data);
}
