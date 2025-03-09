import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./User";

@Entity()
export class ResetToken {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  token!: string; // Hashed token

  @ManyToOne(() => User, (user) => user.id)
  user!: User;

  @Column()
  expiresAt!: Date; // Expiration date

  @CreateDateColumn()
  createdAt!: Date;
}
