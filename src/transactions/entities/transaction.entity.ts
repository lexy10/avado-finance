import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";

@Entity({ name: 'transactions' })
export class TransactionEntity {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number

    @Column({ type: "float", default: 0 })
    amount: number

    @Column({ type: "enum", enum: ['deposit', 'withdrawal', 'swap'] })
    type: string

    @Column({type: "varchar", nullable: true})
    currency: string

    @Column({type: "varchar", nullable: true})
    from_wallet_address: string

    @Column({type: "varchar", nullable: true})
    from_wallet_currency: string

    @Column({type: "varchar", nullable: true})
    to_wallet_address: string

    @Column({type: "varchar", nullable: true})
    to_wallet_currency: string

    @Column({ type: "varchar", nullable: true})
    transaction_network: string

    @Column({ type: "varchar", nullable: true})
    transaction_status: string

    @Column({ type: "varchar", nullable: true})
    transaction_hash: string

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

}
