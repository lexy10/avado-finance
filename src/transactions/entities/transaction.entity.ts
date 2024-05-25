import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity({ name: 'transactions' })
export class TransactionEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'float', nullable: true })
  amount: number;

  @Column({ type: 'float', nullable: true })
  amount_in_usd: number;

  @Column({
    type: 'enum',
    enum: ['Crypto Deposit', 'P2P Deposit', 'Crypto Withdrawal', 'Swap', 'Transfer', 'Fiat Withdrawal', 'deposit', 'withdrawal', 'swap', 'transfer', 'p2p'],
  })
  type: string;

  @Column({ type: 'varchar', nullable: true })
  currency: string;

  @Column({ type: 'varchar', nullable: true })
  from_wallet_address: string;

  @Column({ type: 'varchar', nullable: true })
  from_wallet_currency: string;

  @Column({ type: 'varchar', nullable: true })
  to_wallet_address: any;

  @Column({ type: 'varchar', nullable: true })
  to_wallet_currency: string;

  @Column({ type: 'varchar', nullable: true })
  transaction_network: string;

  @Column({ type: 'varchar', nullable: true })
  transaction_status: string;

  @Column({ type: 'varchar', nullable: true })
  transaction_hash: string;

  @Column({ type: 'varchar', nullable: true })
  deposit_id: string;

  @Column({ type: 'varchar', nullable: true })
  transaction_id: string;

  @Column({ type: 'varchar', nullable: true })
  transaction_confirmations: string;

  @Column({ type: 'float', nullable: true })
  transaction_fee: number;

  @Column({ type: 'float', nullable: true })
  transaction_fee_in_usd: number;

  @Column({ type: 'text', nullable: true })
  post_data: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.transactions)
  user: UserEntity;
}
