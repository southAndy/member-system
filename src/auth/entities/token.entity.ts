import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Member } from '../../members/entities/member.entity';

@Entity()
export class Token {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 儲存 refresh token 的值
  @Column()
  token: string;

  // @ManyToOne() 定義多對一關係：多個 token 可以屬於同一個 member
  // 第一個參數是關聯的 Entity，第二個參數定義反向關係（這裡不需要從 Member 反查 Token，所以省略）
  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  // @JoinColumn() 指定外鍵欄位名稱，對應到資料庫的 user_id 欄位
  @JoinColumn({ name: 'user_id' })
  member: Member;

  // 單獨存一份 user_id，方便直接用 ID 查詢而不需要 join
  @Column()
  user_id: string;

  // token 的過期時間
  @Column({ type: 'timestamp' })
  expires_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
