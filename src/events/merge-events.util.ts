import { Event } from './event.entity';
import { EventStatus } from './event-status.enum';

// Groups events into clusters of overlapping events. Classic "merge
// intervals" approach: sort by start time, then sweep through and if the
// next event starts before (or exactly when) the current cluster ends, it
// joins the cluster and extends the cluster's end time if needed.
//
// One thing worth calling out: this is TRANSITIVE. If E1 is 2-3, E2 is
// 2:45-4, and E3 is 3:30-4:30, then E1 overlaps E2 and E2 overlaps E3, so all
// three get merged into one 2-4:30 block even though E1 and E3 don't overlap
// directly. The assignment's example only shows two events, so this was a
// judgment call - felt like the more standard/expected behavior for "merge
// overlapping events" rather than only merging strict pairs.
//
// Groups of size 1 (no overlap with anything) are still returned, just as
// single-item arrays, so the caller can tell "nothing to merge" apart from
// "found a merge".
export function groupOverlappingEvents(events: Event[]): Event[][] {
  if (events.length === 0) return [];

  const sorted = [...events].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime(),
  );

  const groups: Event[][] = [];
  let currentGroup: Event[] = [sorted[0]];
  let currentEnd = sorted[0].endTime.getTime();

  for (let i = 1; i < sorted.length; i++) {
    const event = sorted[i];
    if (event.startTime.getTime() <= currentEnd) {
      // overlaps (or touches) the current cluster, extend it
      currentGroup.push(event);
      currentEnd = Math.max(currentEnd, event.endTime.getTime());
    } else {
      groups.push(currentGroup);
      currentGroup = [event];
      currentEnd = event.endTime.getTime();
    }
  }
  groups.push(currentGroup);

  return groups;
}

// Status priority for merging - if any event in the group is still IN_PROGRESS
// or TODO, the merged event isn't done yet. Only mark COMPLETED if literally
// everything in the group was already completed. This is basically "most
// pessimistic status wins", which felt like the safer default per the
// instructions ("pick a reasonable value").
const STATUS_PRIORITY: Record<EventStatus, number> = {
  [EventStatus.TODO]: 0,
  [EventStatus.IN_PROGRESS]: 1,
  [EventStatus.COMPLETED]: 2,
};

function mergeStatus(events: Event[]): EventStatus {
  return events.reduce((worst, e) => {
    return STATUS_PRIORITY[e.status] < STATUS_PRIORITY[worst]
      ? e.status
      : worst;
  }, EventStatus.COMPLETED);
}

// Takes a group of overlapping events and builds the single merged event.
// Doesn't touch the DB - just returns a plain object with the fields the
// merged event should have. The caller decides how to actually persist it.
export function buildMergedEvent(group: Event[]) {
  const startTime = new Date(
    Math.min(...group.map((e) => e.startTime.getTime())),
  );
  const endTime = new Date(Math.max(...group.map((e) => e.endTime.getTime())));

  const title = group.map((e) => e.title).join(' + ');

  const description = group
    .map((e) => e.description)
    .filter((d): d is string => !!d)
    .join('; ');

  // union of invitees across all merged events, deduped by id
  const inviteesById = new Map<number, Event['invitees'][number]>();
  for (const event of group) {
    for (const invitee of event.invitees ?? []) {
      inviteesById.set(invitee.id, invitee);
    }
  }

  return {
    title,
    description: description || undefined,
    status: mergeStatus(group),
    startTime,
    endTime,
    invitees: Array.from(inviteesById.values()),
  };
}
