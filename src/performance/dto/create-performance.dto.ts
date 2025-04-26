import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsObject,
  IsOptional,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

type ResourceLoadTimeType = {
  name: string;
  duration: number;
  size: number;
  type: string;
};

type DeviceInfoType = {
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  deviceMemory: number;
  connection: string;
};

export class CreatePerformanceDto {
  @IsString()
  path: string;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  timestamp: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  pageLoadTime: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  domContentLoadedTime: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  timeToFirstByte: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  firstContentfulPaint: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  largestContentfulPaint: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  cumulativeLayoutShift: number;

  @IsArray()
  resourceLoadTimes: ResourceLoadTimeType[];

  @IsObject()
  deviceInfo: DeviceInfoType;
}
