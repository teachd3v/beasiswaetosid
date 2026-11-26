export interface Bindings {
  DB: D1Database;
  MEDIA_BUCKET: R2Bucket;
  R2_PUBLIC_URL?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'editor';
}

export interface Variables {
  adminUser: AdminUser;
}

export type AppEnv = {
  Bindings: Bindings;
  Variables: Variables;
};
