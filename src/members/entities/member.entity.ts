import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// @Entity() 告訴 TypeORM 這個 class 對應到資料庫的一張表，表名預設是 class 名稱的小寫（member）
@Entity()
export class Member {
  // @PrimaryGeneratedColumn('uuid') 自動產生 UUID 作為主鍵，不需要手動指定
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // @Column({ unique: true }) 表示這個欄位在資料庫中是唯一的，不能有重複值
  @Column({ unique: true })
  email!: string;

  @Column()
  name!: string;

  // 儲存的是 bcrypt 雜湊後的密碼，不是明文
  @Column()
  password!: string;

  // @Column({ default: false }) 設定預設值，新建的會員預設未驗證
  @Column({ default: false })
  is_verified!: boolean;

  // nullable: true 表示這個欄位可以是 null（可選欄位）
  @Column({ type: 'varchar', nullable: true })
  verification_token!: string | null;

  // @CreateDateColumn() 會在 insert 時自動填入當前時間，不需要手動設定
  @CreateDateColumn()
  created_at!: Date;

  // @UpdateDateColumn() 會在每次 update 時自動更新為當前時間
  @UpdateDateColumn()
  updated_at!: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_login_at!: Date | null;
}
