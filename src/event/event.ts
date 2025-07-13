import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  Repository,
} from 'typeorm';
import { User } from '../user/user';
import { Injectable, Controller, Post, Get, Body, Param, Delete, Put } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

export type EventStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'varchar' })
  status: EventStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @ManyToMany(() => User, (user) => user.events, { cascade: true })
  @JoinTable()
  invitees: User[];
}

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event) private eventRepo: Repository<Event>,
    @InjectRepository(User) private userRepo: Repository<User>
  ) {}

	// POST
  async create(data: Partial<Event>) {
    const event = this.eventRepo.create(data);
    return await this.eventRepo.save(event);
  }

	// POST('merge-all')
	async mergeAll(userId: number): Promise<Event> {
		const user = await this.userRepo.findOne({
			where: { id: userId },
			relations: ['events'],
		});

		if (!user) {
			throw new Error('User not found');
		}

		const events = user.events.sort(
			(a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
		);

		if (events.length < 2) return events[0];

		const mergedEvents: Event[] = [];
		let current = { ...events[0] };

		for (let i = 1; i < events.length; i++) {
			const next = events[i];

			const overlap =
				new Date(current.endTime).getTime() >= new Date(next.startTime).getTime();

			if (overlap) {
				current.title = `${current.title} / ${next.title}`;
				current.description = `${current.description ?? ''} ${next.description ?? ''}`.trim();
				current.status = this.pickStatus(current.status, next.status);
				current.startTime = new Date(
					Math.min(new Date(current.startTime).getTime(), new Date(next.startTime).getTime())
				);
				current.endTime = new Date(
					Math.max(new Date(current.endTime).getTime(), new Date(next.endTime).getTime())
				);
				current.invitees = this.mergeInvitees(current.invitees, next.invitees);
			} else {
				mergedEvents.push({ ...current });
				current = { ...next };
			}
		}
		mergedEvents.push(current);

		await this.eventRepo.remove(events);
		const savedMerged = await this.eventRepo.save(mergedEvents);

		user.events = savedMerged;
		await this.userRepo.save(user);

		return savedMerged[0];
	}

	private mergeInvitees(inv1: User[], inv2: User[]): User[] {
		const all = [...inv1, ...inv2];
		const map = new Map<number, User>();
		all.forEach((u) => map.set(u.id, u));
		return Array.from(map.values());
	}

	private pickStatus(a: EventStatus, b: EventStatus): EventStatus {
		const priority = { TODO: 1, IN_PROGRESS: 2, COMPLETED: 3 };
		return priority[a] > priority[b] ? a : b;
	}

	// GET()
  async findAll() {
    return await this.eventRepo.find({ relations: ['invitees'] });
  }
	
	// GET(':id')
	async findById(id: number) {
		return await this.eventRepo.findOne({
			where: { id },
			relations: ['invitees'],
		});
	}

	// DELETE
	async deleteById(id: number) {
		await this.eventRepo.delete(id);
		return { message: `Event ${id} deleted.` };
	}

	// PUT
	async update(id: number, data: Partial<Event>) {
		await this.eventRepo.update(id, data);
		return this.findById(id);
	}
}

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  async create(@Body() data: Partial<Event>) {
    return this.eventService.create(data);
  }

	@Post('merge-all')
	async mergeAll(@Body() body: { userId: number }) {
		return this.eventService.mergeAll(body.userId);
	}

	@Get()
  async findAll() {
    return this.eventService.findAll();
  }	

	@Get(':id')
	async findById(@Param('id') id: number) {
		return this.eventService.findById(Number(id));
	}

	@Delete(':id')
	async deleteById(@Param('id') id: number) {
		return this.eventService.deleteById(Number(id));
	}

	@Put(':id')
	async update(@Param('id') id: number, @Body() data: Partial<Event>) {
		return this.eventService.update(Number(id), data);
	}
}
