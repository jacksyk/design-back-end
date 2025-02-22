import { IsNotEmpty, IsOptional } from 'class-validator';

export class TranslateDto {
  /** 传递的url值 */
  @IsNotEmpty()
  url: string;
  /** 传递的参数类型 */
  @IsNotEmpty()
  type: 'query' | 'body';
  @IsNotEmpty()
  /** 传递的参数 */
  params: Record<string, any>;
  @IsNotEmpty()
  /** 请求的方法 */
  method: 'get' | 'post' | 'put' | 'delete';
  /** 期望返回的名字 */
  @IsOptional()
  responseName: string;
}
