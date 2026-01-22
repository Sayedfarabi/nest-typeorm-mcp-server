import { BaseEntity } from 'src/common/entity/base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { User } from '../user/user.entity';

@Entity('admins')
export class Admin extends BaseEntity {
  @Column({ unique: true })
  gu_id: string;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column()
  gender: string;

  @OneToOne(() => User, (user) => user.admin, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}
