import { SetMetadata } from '@nestjs/common';

/** 不需要登录 */
export const NotRequireLogin = () => SetMetadata('not-require-login', true);
