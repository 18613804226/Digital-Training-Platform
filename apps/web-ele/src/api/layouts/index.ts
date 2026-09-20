import { requestClient } from '#/api/request';

/**
 * 查询首页数据展示
 */
export async function getNotificationsApi() {
  return requestClient.get<any>('/notifications');
}
// mark-as-read
export async function patchNotificationsReadApi(data: { ids: any[] }) {
  return requestClient.patch<any>('/notifications/mark-as-read', data);
}
export async function deleteNotificationsOneApi(data: { id: any }) {
  return requestClient.delete<any>(`/notifications/${data.id}`);
}
export async function deleteNotificationsAllApi() {
  return requestClient.delete<any>('/notifications/clear');
}
// mark-all-as-read
export async function patchMarkAllAsReadApi() {
  return requestClient.patch<any>('/notifications/mark-all-as-read');
}
