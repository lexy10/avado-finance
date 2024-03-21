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

    @Column({ type: 'boolean', default: false })
    is_verified: boolean

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}
