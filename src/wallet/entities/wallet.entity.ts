import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";

@Entity({ name: 'wallets' })
export class Wallet {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number

    @Column({ type: 'bigint' })
    user_id: number

    @Column({ type: 'varchar' })
    wallet_address: string

    @Column({ type: 'varchar' })
    wallet_type: string

    @Column({ type: 'varchar' })
    wallet_network: string

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}
