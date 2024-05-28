import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TransactionEntity } from '../../transactions/entities/transaction.entity';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', nullable: true })
  full_name: string;

  @Column({ type: 'varchar', nullable: true })
  username: string;

  @Column({ type: 'varchar', unique: true })
  email_address: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', nullable: true })
  phone_number: string;

  @Column({ type: 'varchar', nullable: true })
  date_of_birth: string;

  @Column({ type: 'varchar', nullable: true })
  transaction_pin: number;

  @Column({ type: 'varchar', nullable: true })
  verification_code: string;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({ type: 'enum', default: 'user', enum: ['user', 'admin'] })
  user_role: string;

  @Column({ type: 'float', default: 0 })
  ngn_balance: number;

  @Column({ type: 'float', default: 0 })
  usdt_balance: number;

  @Column({ type: 'float', default: 0 })
  btc_balance: number;

  @Column({ type: 'float', default: 0 })
  usdc_balance: number;

  @Column({ type: 'float', default: 0 })
  eth_balance: number;

  @Column({ type: 'float', default: 0 })
  sol_balance: number;

  @Column({ type: 'float', default: 0 })
  bnb_balance: number;

  @Column({ type: 'float', default: 0 })
  matic_balance: number;

  @Column({ type: 'varchar', nullable: true })
  referral_code: string;

  @Column({ type: 'float', nullable: true, default: 0 })
  referral_bonus_balance: number;

  @Column({ type: 'float', nullable: true, default: 0 })
  referral_bonus_total: number;

  @Column({ type: 'float', nullable: true, default: 0 })
  referral_count: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  referral_bonus_start: number;

  @Column({ type: 'varchar', nullable: true })
  password_token: string;

  @ManyToOne((type) => UserEntity, { nullable: true }) // Many users can have the same referrer (ManyToOne)
  referrer: UserEntity; // Refers to another UserEntity

  @Column({ type: 'boolean', nullable: true, default: false })
  has_compensated_referrer: boolean;

  @Column({ type: 'boolean', default: false })
  has_received_swap_bonus: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ type: 'varchar', nullable: true })
  bank_name: string;

  @Column({ type: 'varchar', nullable: true })
  account_name: string;

  @Column({ type: 'varchar', nullable: true })
  account_number: string;

  @Column({ type: 'text', nullable: true })
  verification_id_image: string;

  @Column({ type: 'text', nullable: true })
  verification_liveliness_image: string;

  @Column({
    type: 'enum',
    enum: ['unverified', 'pending', 'verified', 'failed'],
    default: 'unverified',
  })
  verification_status: string;

  wallets(): {
    ngn: any;
    usdt: any;
    usdc: any;
    btc: any;
    eth: any;
    bnb: any;
    sol: any;
    matic: any;
  } {
    return {
      ngn: {
        balance: this.ngn_balance,
      },
      usdt: {
        balance: this.usdt_balance,
      },
      usdc: {
        balance: this.usdc_balance,
      },
      btc: {
        balance: this.btc_balance,
      },
      eth: {
        balance: this.eth_balance,
      },
      bnb: {
        balance: this.bnb_balance,
      },
      sol: {
        balance: this.sol_balance,
      },
      matic: {
        balance: this.matic_balance,
      },
    };
  }

  @OneToMany(() => TransactionEntity, (transaction) => transaction.user)
  transactions: TransactionEntity[];
}
