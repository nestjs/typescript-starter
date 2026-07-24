import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Event } from './event.entity';
import { User } from '../users/user.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { buildMergedEvent, groupOverlappingEvents } from './merge-events.util';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateEventDto): Promise<Event> {
    let invitees: User[] = [];
    if (dto.inviteeIds?.length) {
      invitees = await this.userRepository.findBy({ id: In(dto.inviteeIds) });
      // not being strict about missing ids here - if you pass an id that
      // doesn't exist, it's just silently skipped. Could easily throw a
      // BadRequestException instead if that's not the behavior you want.
    }

    const event = this.eventRepository.create({
      title: dto.title,
      description: dto.description,
      status: dto.status,
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
      invitees,
    });

    return this.eventRepository.save(event);
  }

  async findOne(id: number): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: { invitees: true },
    });
    if (!event) {
      throw new NotFoundException(`Event ${id} not found`);
    }
    return event;
  }

  async remove(id: number): Promise<void> {
    const event = await this.findOne(id);
    await this.eventRepository.remove(event);
  }

  // Merges all overlapping events that a given user is invited to.
  //
  // Reading of the spec: "merge all overlapping events ... to a user" means
  // scoped to one user's events, not a global merge of every event in the
  // system. For each cluster of overlapping events, we build one merged
  // event whose invitees are the union of everyone invited to any event in
  // the cluster, then delete the originals. Everything runs in one
  // transaction so we don't end up half-merged if something blows up
  // partway through.
  async mergeAllForUser(userId: number): Promise<Event[]> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    return this.dataSource.transaction(async (manager) => {
      const eventRepo = manager.getRepository(Event);

      // Not the most efficient query (loads every event and filters in JS)
      // but it's simple and correct. A bigger dataset would want a proper
      // join/where on the invitees relation instead.
      const allEvents = await eventRepo.find({
        relations: { invitees: true },
      });
      const userEvents = allEvents.filter((e) =>
        e.invitees.some((invitee) => invitee.id === userId),
      );

      const groups = groupOverlappingEvents(userEvents);

      const result: Event[] = [];

      for (const group of groups) {
        if (group.length === 1) {
          // nothing to merge, leave it exactly as it was
          result.push(group[0]);
          continue;
        }

        const merged = buildMergedEvent(group);
        const savedMerged = await eventRepo.save(eventRepo.create(merged));

        // clear join table rows before deleting so we're not relying on the
        // DB to figure out cascade behavior for us
        for (const original of group) {
          original.invitees = [];
          await eventRepo.save(original);
        }
        await eventRepo.remove(group);

        result.push(savedMerged);
      }

      return result;
    });
  }
}
