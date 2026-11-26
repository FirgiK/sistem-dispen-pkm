export type PermissionId =
  | 'dashboard:read'
  | 'dispensasi:read'
  | 'dispensasi:decide'
  | 'peta:read'
  | 'peta:manage'
  | 'penyakit:read'
  | 'penyakit:analyze'
  | 'kinerja:read'
  | 'rbac:manage'
  | 'audit:read';

export interface AuthProfile {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
}
