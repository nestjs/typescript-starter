import { buildMergedEvent, groupOverlappingEvents } from './merge-events.util';
import { Event } from './event.entity';
import { EventStatus } from './event-status.enum';
import { User } from '../users/user.entity';

// small helper so the tests below aren't full of boilerplate object literals
function makeEvent(overrides: Partial<Event>): Event {
  return {
    id: 0,
    title: 'untitled',
    description: undefined,
    status: EventStatus.TODO,
    createdAt: new Date(),
    updatedAt: new Date(),
    startTime: new Date(),
    endTime: new Date(),
    invitees: [],
    ...overrides,
  } as Event;
}

function makeUser(id: number, name = `user-${id}`): User {
  return { id, name, events: [] } as User;
}

// using a fixed date so times below are readable as just "2pm", "3pm" etc
const day = (hour: number, minute = 0) => new Date(2024, 0, 1, hour, minute);

describe('groupOverlappingEvents', () => {
  it('returns an empty array when given no events', () => {
    expect(groupOverlappingEvents([])).toEqual([]);
  });

  it('puts non-overlapping events in their own groups', () => {
    const e1 = makeEvent({ id: 1, startTime: day(9), endTime: day(10) });
    const e2 = makeEvent({ id: 2, startTime: day(14), endTime: day(15) });

    const groups = groupOverlappingEvents([e1, e2]);

    expect(groups).toHaveLength(2);
    expect(groups[0]).toEqual([e1]);
    expect(groups[1]).toEqual([e2]);
  });

  it('groups the classic overlapping example from the assignment (2-3pm and 2:45-4pm)', () => {
    const e1 = makeEvent({ id: 1, startTime: day(14), endTime: day(15) });
    const e2 = makeEvent({ id: 2, startTime: day(14, 45), endTime: day(16) });

    const groups = groupOverlappingEvents([e1, e2]);

    expect(groups).toHaveLength(1);
    expect(groups[0]).toEqual([e1, e2]);
  });

  it('chains transitively overlapping events into a single group', () => {
    // E1: 2-3, E2: 2:45-4, E3: 3:30-4:30 -> E1 doesn't touch E3 directly,
    // but they should still all end up merged via E2
    const e1 = makeEvent({ id: 1, startTime: day(14), endTime: day(15) });
    const e2 = makeEvent({ id: 2, startTime: day(14, 45), endTime: day(16) });
    const e3 = makeEvent({
      id: 3,
      startTime: day(15, 30),
      endTime: day(16, 30),
    });

    const groups = groupOverlappingEvents([e1, e2, e3]);

    expect(groups).toHaveLength(1);
    expect(groups[0]).toEqual([e1, e2, e3]);
  });

  it('does not merge events that just happen to be next to each other with no overlap', () => {
    const e1 = makeEvent({ id: 1, startTime: day(9), endTime: day(10) });
    const e2 = makeEvent({ id: 2, startTime: day(10, 30), endTime: day(11) });

    const groups = groupOverlappingEvents([e1, e2]);

    expect(groups).toHaveLength(2);
  });

  it('works regardless of the input order (sorts internally)', () => {
    const e1 = makeEvent({ id: 1, startTime: day(14), endTime: day(15) });
    const e2 = makeEvent({ id: 2, startTime: day(14, 45), endTime: day(16) });

    const groups = groupOverlappingEvents([e2, e1]);

    expect(groups).toHaveLength(1);
    expect(groups[0]).toEqual([e1, e2]);
  });
});

describe('buildMergedEvent', () => {
  it('takes the earliest start and latest end across the group', () => {
    const e1 = makeEvent({ startTime: day(14), endTime: day(15) });
    const e2 = makeEvent({ startTime: day(14, 45), endTime: day(16) });

    const merged = buildMergedEvent([e1, e2]);

    expect(merged.startTime).toEqual(day(14));
    expect(merged.endTime).toEqual(day(16));
  });

  it('joins titles together', () => {
    const e1 = makeEvent({ title: 'Standup' });
    const e2 = makeEvent({ title: 'Design review' });

    const merged = buildMergedEvent([e1, e2]);

    expect(merged.title).toBe('Standup + Design review');
  });

  it('joins descriptions and skips ones that are missing', () => {
    const e1 = makeEvent({ description: 'talk about sprint' });
    const e2 = makeEvent({ description: undefined });
    const e3 = makeEvent({ description: 'talk about designs' });

    const merged = buildMergedEvent([e1, e2, e3]);

    expect(merged.description).toBe('talk about sprint; talk about designs');
  });

  it('picks the most pessimistic status - not everything COMPLETED means not COMPLETED', () => {
    const e1 = makeEvent({ status: EventStatus.COMPLETED });
    const e2 = makeEvent({ status: EventStatus.IN_PROGRESS });

    const merged = buildMergedEvent([e1, e2]);

    expect(merged.status).toBe(EventStatus.IN_PROGRESS);
  });

  it('is only COMPLETED if every event in the group was completed', () => {
    const e1 = makeEvent({ status: EventStatus.COMPLETED });
    const e2 = makeEvent({ status: EventStatus.COMPLETED });

    const merged = buildMergedEvent([e1, e2]);

    expect(merged.status).toBe(EventStatus.COMPLETED);
  });

  it('unions invitees across the group and dedupes shared ones', () => {
    const alice = makeUser(1, 'alice');
    const bob = makeUser(2, 'bob');
    const carol = makeUser(3, 'carol');

    const e1 = makeEvent({ invitees: [alice, bob] });
    const e2 = makeEvent({ invitees: [bob, carol] });

    const merged = buildMergedEvent([e1, e2]);

    expect(merged.invitees.map((u) => u.id).sort()).toEqual([1, 2, 3]);
  });
});
