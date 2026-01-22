import { BaseEntity } from 'src/common/entity/base.entity';
import { UserRole } from 'src/common/enums/user-role.enum';
import { UserStatus } from 'src/common/enums/user-status.enum';
import { Column, Entity, OneToOne } from 'typeorm';
import { Admin } from '../admin/admin.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  gu_id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @OneToOne(() => Admin, (admin) => admin?.user)
  admin?: Admin;
}
