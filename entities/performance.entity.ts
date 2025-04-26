import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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

@Entity('performance')
export class Performance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  path: string;

  @Column({ type: 'bigint' })
  timestamp: number;

  @Column({ type: 'float' })
  pageLoadTime: number;

  @Column({ type: 'float' })
  domContentLoadedTime: number;

  @Column({ type: 'float' })
  timeToFirstByte: number;

  @Column({ type: 'float' })
  firstContentfulPaint: number;

  @Column({ type: 'float' })
  largestContentfulPaint: number;

  @Column({ type: 'float' })
  cumulativeLayoutShift: number;

  @Column({ type: 'json' })
  resourceLoadTimes: ResourceLoadTimeType[];

  @Column({ type: 'json' })
  deviceInfo: DeviceInfoType;
}
