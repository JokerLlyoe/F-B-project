import { PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeUpdate, BeforeInsert } from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;

  @Column({ default: 0 })
  rowVersion: number;

  @Column({ default: true })
  isActive: boolean;

  @BeforeInsert()
  beforeInsert() {
    if (this.rowVersion === undefined) {
      this.rowVersion = 0;
    }
    if (this.isActive === undefined) {
      this.isActive = true;
    }
  }

  @BeforeUpdate()
  beforeUpdate() {
    this.rowVersion += 1;
  }
}
