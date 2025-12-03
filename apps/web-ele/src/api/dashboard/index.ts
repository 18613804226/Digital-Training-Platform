import { requestClient } from '#/api/request';

/**
 * 查询首页数据展示
 */
export async function getDashboardApi() {
  return requestClient.get<any>('/admin/dashboard');
}
export async function trackPageApi() {
  return requestClient.post<any>('/track/page-view');
}
