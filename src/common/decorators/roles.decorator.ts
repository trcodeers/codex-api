import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Array<'Aspirant' | 'Admin'>) => SetMetadata(ROLES_KEY, roles);
