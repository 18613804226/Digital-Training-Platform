import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  return requestClient.get<UserInfo>('/user/info');
}
// 获取所有用户列表
export async function getUserListApi(params: any) {
  return requestClient.get<UserInfo>('/user/list', { params });
}
// 删除用户
export async function deleteUserApi(params: any) {
  return requestClient.delete<UserInfo>('/user/' + params.id);
}
