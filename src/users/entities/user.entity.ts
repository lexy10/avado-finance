import {
    Column,
    CreateDateColumn,
    Entity, ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {TransactionEntity} from "../../transactions/entities/transaction.entity";

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

    @Column({ type: 'enum', default: 'user', enum: ['user', 'admin'] })
    user_role: string

    @Column({ type: 'float', default: 0 })
    ngn_balance: number

    /*@Column({ type: 'float', default: 0 })
    usd_balance: number*/

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

    @ManyToOne(type => UserEntity, { nullable: true }) // Many users can have the same referrer (ManyToOne)
    referrer: UserEntity; // Refers to another UserEntity

    @Column({ type: "boolean", nullable: true, default: false })
    has_compensated_referrer: boolean

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

    @Column({ type: "boolean", default: false })
    has_received_swap_bonus: boolean

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    wallets(): { ngn: any, usdt: any, usdc: any, btc: any, eth: any, bnb: any, solana: any, matic: any } {
        return {
            ngn: {
                "balance": 2800
            },
            usdt: {
                "address": this.usdt_wallet_address,
                "balance": this.usdt_balance
            },
            usdc: {
                "address": this.usdc_wallet_address,
                "balance": this.usdc_balance
            },
            btc: {
                "address": this.btc_wallet_address,
                "balance": this.btc_balance
            },
            eth: {
                "address": this.eth_wallet_address,
                "balance": this.eth_balance
            },
            bnb: {
                "address": this.bnb_wallet_address,
                "balance": this.bnb_balance
            },
            solana: {
                "address": this.solana_wallet_address,
                "balance": this.solana_balance
            },
            matic: {
                "address": this.matic_wallet_address,
                "balance": this.matic_balance
            }
        }
    }

    @OneToMany(() => TransactionEntity, transaction => transaction.user)
    transactions: TransactionEntity[];
}
