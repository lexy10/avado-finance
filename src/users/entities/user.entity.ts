import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";

@Entity({ name: 'users' })
export class UserEntity {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number

    @Column({ type: 'varchar', nullable: true })
    full_name: string

    @Column({ type: 'varchar', nullable: true })
    username: string

    @Column({ type: "varchar", unique: true })
    email_address: string

    @Column({ type: "varchar" })
    password: string

    @Column({ type: "varchar", nullable: true })
    phone_number: string

    @Column({ type: "varchar", nullable: true })
    transaction_pin: number

    @Column({ type: "varchar", nullable: true })
    verification_code: string

    @Column({ type: 'boolean', default: false })
    is_verified: boolean

    @Column({ type: 'float', default: 0 })
    ngn_balance: number

    @Column({ type: 'float', default: 0 })
    usd_balance: number

    @Column({ type: 'float', default: 0 })
    usdt_balance: number

    @Column({ type: 'float', default: 0 })
    btc_balance: number

    @Column({ type: 'float', default: 0 })
    usdc_balance: number

    @Column({ type: 'float', default: 0 })
    eth_balance: number

    @Column({ type: 'float', default: 0 })
    solana_balance: number

    @Column({ type: 'float', default: 0 })
    bnb_balance: number

    @Column({ type: 'float', default: 0 })
    matic_balance: number

    @Column({ type: "varchar", nullable: true })
    referral_code: string

    @Column({ type: "float", nullable: true })
    referral_bonus: number

    @Column({ type: "varchar", unique: true, nullable: true })
    usdt_wallet_address: string

    @Column({ type: "varchar", unique: true, nullable: true })
    btc_wallet_address: string

    @Column({ type: "varchar", unique: true, nullable: true })
    usdc_wallet_address: string

    @Column({ type: "varchar", unique: true, nullable: true })
    eth_wallet_address: string

    @Column({ type: "varchar", unique: true, nullable: true })
    solana_wallet_address: string

    @Column({ type: "varchar", unique: true, nullable: true })
    bnb_wallet_address: string

    @Column({ type: "varchar", unique: true, nullable: true })
    matic_wallet_address: string

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}
