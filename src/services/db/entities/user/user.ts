import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
class User {
  /**
   * User record id
   */
  @PrimaryGeneratedColumn()
  public id?: number;

  /**
   * User name
   */
  @Column()
  public name: string;

  /**
   * User identification, will be searched by so Index would be handy
   */
  @Column({
    nullable: false,
    unique: true,
  })
  public email: string;
}

export { User };
