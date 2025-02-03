import { IsString } from 'class-validator';

export class SearchActivityDto {
  @IsString()
  searchContent: string;
}
