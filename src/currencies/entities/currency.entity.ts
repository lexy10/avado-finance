import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";

@Entity({ name: 'currencies' })
export class CurrencyEntity {

    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number

    @Column({ type: 'varchar' })
    coin_name: string

    @Column({ type: 'varchar' })
    coin_fullname: string

    @Column({ type: 'float' })
    coin_rate: number

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

}
