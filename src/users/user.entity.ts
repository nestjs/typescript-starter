import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Event } from '../events/event.entity';

// The spec says User should have "events (list of strings)". I'm reading that
// as "a list of event ids", not literally a string[] column, because the
// Event entity already needs a proper `invitees: User[]` relation and there's
// no reason to keep two separate sources of truth for the same many-to-many
// link. So this is the inverse side of Event.invitees. If you actually just
// want raw id strings on the user with no relation, that's a much smaller
// change (swap this for `@Column('simple-array') eventIds: string[]`), but
// then mergeAll has to manually keep two things in sync instead of letting
// TypeORM do it.
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Event, (event) => event.invitees)
  events: Event[];
}
