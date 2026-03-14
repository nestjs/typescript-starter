import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { EventStatus } from '../events/entities/event-status.enum';
import { Event } from '../events/entities/event.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

type MergeGroup = {
  events: Event[];
  startTime: Date;
  endTime: Date;
  invitees: User[];
  title: string;
  description?: string;
  status: EventStatus;
};

@Injectable()
export class UsersService {
  private static readonly statusPriority: Record<EventStatus, number> = {
    [EventStatus.COMPLETED]: 0,
    [EventStatus.TODO]: 1,
    [EventStatus.IN_PROGRESS]: 2,
  };

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async mergeAll(userId: number): Promise<Event[]> {
    return this.dataSource.transaction(async (manager) => {
      const usersRepository = manager.getRepository(User);
      const eventsRepository = manager.getRepository(Event);
      const user = await usersRepository.findOne({
        where: { id: userId },
        relations: { events: { invitees: true } },
      });

      if (!user) {
        throw new NotFoundException(`User with id ${userId} not found`);
      }

      const sortedEvents = [...user.events].sort(
        (left, right) =>
          left.startTime.getTime() - right.startTime.getTime() ||
          left.endTime.getTime() - right.endTime.getTime(),
      );
      const mergeGroups = this.buildMergeGroups(sortedEvents);

      if (!mergeGroups.length) {
        return sortedEvents;
      }

      const eventsToRemove = mergeGroups.flatMap((group) => group.events);
      await eventsRepository.remove(eventsToRemove);

      for (const group of mergeGroups) {
        const mergedEvent = eventsRepository.create({
          title: group.title,
          description: group.description,
          status: group.status,
          startTime: group.startTime,
          endTime: group.endTime,
          invitees: group.invitees,
        });
        await eventsRepository.save(mergedEvent);
      }

      const updatedUser = await usersRepository.findOne({
        where: { id: userId },
        relations: { events: { invitees: true } },
      });

      return [...(updatedUser?.events ?? [])].sort(
        (left, right) =>
          left.startTime.getTime() - right.startTime.getTime() ||
          left.endTime.getTime() - right.endTime.getTime(),
      );
    });
  }

  private buildMergeGroups(events: Event[]): MergeGroup[] {
    const groups: MergeGroup[] = [];
    let currentGroup: Event[] = [];
    let currentEndTime: Date | null = null;

    for (const event of events) {
      if (!currentGroup.length) {
        currentGroup = [event];
        currentEndTime = event.endTime;
        continue;
      }

      if (event.startTime.getTime() < currentEndTime!.getTime()) {
        currentGroup.push(event);
        if (event.endTime.getTime() > currentEndTime!.getTime()) {
          currentEndTime = event.endTime;
        }
        continue;
      }

      if (currentGroup.length > 1) {
        groups.push(this.mergeGroup(currentGroup));
      }

      currentGroup = [event];
      currentEndTime = event.endTime;
    }

    if (currentGroup.length > 1) {
      groups.push(this.mergeGroup(currentGroup));
    }

    return groups;
  }

  private mergeGroup(events: Event[]): MergeGroup {
    const title = this.joinText(events.map((event) => event.title), ' | ');
    const description = this.joinText(
      events.map((event) => event.description),
      '\n',
    );
    const invitees = Array.from(
      new Map(
        events
          .flatMap((event) => event.invitees)
          .map((invitee) => [invitee.id, invitee]),
      ).values(),
    );
    const status = events.reduce((selectedStatus, event) =>
      UsersService.statusPriority[event.status] >
      UsersService.statusPriority[selectedStatus]
        ? event.status
        : selectedStatus,
    events[0].status);

    return {
      events,
      startTime: events[0].startTime,
      endTime: events.reduce(
        (latestEndTime, event) =>
          event.endTime.getTime() > latestEndTime.getTime()
            ? event.endTime
            : latestEndTime,
        events[0].endTime,
      ),
      invitees,
      title,
      description: description || undefined,
      status,
    };
  }

  private joinText(
    values: Array<string | undefined>,
    separator: string,
  ): string {
    return Array.from(
      new Set(
        values
          .map((value) => value?.trim())
          .filter((value): value is string => Boolean(value)),
      ),
    ).join(separator);
  }
}
