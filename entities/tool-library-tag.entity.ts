import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ToolLibrary } from './tool-library.entity';

@Entity({
  name: 'tool_library_tag',
})
export class ToolLibraryTag {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;

  @ManyToMany(() => ToolLibrary, (tool) => tool.tags)
  tools: ToolLibrary[];
}
