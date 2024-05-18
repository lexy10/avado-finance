import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";

@Entity({ name: 'p2p' })
export class P2pEntity {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number

    @Column({ type: "varchar" })
    account_name: string

    @Column({ type: "varchar" })
    account_number: string

    @Column({ type: "varchar" })
    bank_name: string

    @Column({ type: "varchar", default: "ngn" })
    currency: string

    @Column({ type: "enum", enum: ['active', 'inactive'], default: 'active' })
    status: string

    @Column( { type: "float", default: 0 } )
    limit: number

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}
