// src/views/user/types.ts

export interface User {
  id: number;
  username: string;
  realName: string;
  email?: string;
  role: 'ADMIN' | 'USER' | 'GUEST';
  status: 'active' | 'disabled';
  avatar?: string;
  createdAt: string;
}

export interface UserQuery {
  page: number;
  pageSize: number;
  keyword?: string;
  role?: string;
  status?: string;
}
