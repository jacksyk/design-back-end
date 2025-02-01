import { SetMetadata } from '@nestjs/common';

/** 需要管理员权限 */
export const RequireAdmin = () => SetMetadata('require-admin', true);
