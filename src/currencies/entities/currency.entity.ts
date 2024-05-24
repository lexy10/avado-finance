import {
    Column,
    CreateDateColumn,
    Entity, JoinTable,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {CurrencyNetworkEntity} from "./currency_networks.entity";

@Entity({ name: 'currencies' })
export class CurrencyEntity {

    @PrimaryGeneratedColumn({ type: "bigint" })
    id: number

    @Column({ type: 'varchar' })
    coin_name: string

    @Column({ type: 'varchar' })
    coin_fullname: string

    @Column({ type: 'simple-array', nullable: true })
    coin_networks: string[]

    @Column({ type: 'float' })
    coin_rate: number

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

}
