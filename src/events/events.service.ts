import { Injectable, NotFoundException, BadRequestException, ForbiddenException  } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Event, Prisma } from '@prisma/client';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  // Service for creating an event
  async createEvent(data: CreateEventDto): Promise<Event> {
    const { startTime, endTime, invitees, ...eventData } = data;
    const now = new Date();

    // Validate field startTime and field endTime
    if (new Date(endTime) <= new Date(startTime)) {
      throw new BadRequestException('endTime must be later than startTime.');
    }

    enum Status {
      TODO = "TODO",
      IN_PROGRESS = "IN_PROGRESS",
      COMPLETED = "COMPLETED",
    }
    
    // Set the status of the event
    let status: Status = Status.TODO; // Default status
    if (new Date(startTime) > now) {
      status = Status.TODO;
    } 
    else if (new Date(endTime) <= now) {
      status = Status.COMPLETED;
    } 
    else {
      status = Status.IN_PROGRESS;
    }

    // Create an event with an empty invitees array first
    const createdEvent = await this.prisma.event.create({
      data: {
        ...eventData,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: status,
        invitees: {
          create: [], 
        },
      },
    });

    // Process each invitee in the invitees field of the request body
    for (const invitee of invitees) {
      // Find the matching user with ID
      const user = await this.prisma.user.findUnique({
        where: { id: invitee.id },
      });

      if (user) { // Check if the ID of the invitee already exists
        // Update the name together with the events
        await this.prisma.user.update({
          where: { id: invitee.id },
          data: { 
            name: invitee.name,
            events: {
              connect: {id: createdEvent.id}
            } 
          },
        }); 
      } 
      else { 
        // Create a new user for the invitee
        await this.prisma.user.create({
          data: {
            id: invitee.id,
            name: invitee.name || 'Default Name',
            events: {
              connect: { id: createdEvent.id },
            },
          },
        });
      }

      // Add the invitee to the invitees of the newly created event
      await this.prisma.event.update({
        where: { id: createdEvent.id },
        data: {
          invitees: {
            connect: { id: invitee.id },
          },
        },
      });
    }

    // Return the created event
    return await this.prisma.event.findUnique({
      where: { id: createdEvent.id },
      include: {
        invitees: true,
      },
    });
  }
  
  // Service for querying an event with ID
  async event(id: number): Promise<Event | null> {
    // Find the event with the mathcing ID
    const event = await this.prisma.event.findUnique({
      where: { id: id },
      include: {
        invitees: true,
      },
    });
    return event;
  }

  // Service for deleting an event with ID
  async deleteEvent(id: number): Promise<Event> {
    try {
      // Delete the event with the matching ID
      return await this.prisma.event.delete({ where: { id: id } });
    } 
    catch (error) {
      throw new NotFoundException(`Could not find event with ID ${id} to delete.`);
    }
  }

  // Implement mergeAll method based on your business logic
  async mergeAllEventsForUser(userId: number) {
    // First check if the user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`Could not find user with ID ${userId}.`);
    }
    
    // Define enum
    enum Status {
      TODO = "TODO",
      IN_PROGRESS = "IN_PROGRESS",
      COMPLETED = "COMPLETED",
    }

    /* Merging overlapping intervals algorithm */
    // Find all events related to the given user
    const userEvents = await this.prisma.event.findMany({
      where: { 
        invitees: { 
          some: { id: userId } 
        } 
      },
      orderBy: { startTime: 'asc' },
      include: { invitees: true }
    });
  
    // First get the updated data of the merged events
    let mergedEventsData = [];
    for (const event of userEvents) {
      const len = mergedEventsData.length;
      const { invitees, ...eventDetails } = event;
      let eventData = { 
        ...eventDetails,
        inviteesId: invitees.map(invitee => invitee.id)
      };

      if (len == 0 || mergedEventsData[len-1].endTime < eventData.startTime) {
        // Push the event data to the array if the event is not overlapping with the previous event
        mergedEventsData.push(eventData);
      }
      else {
        // If overlapping, merging the current event data into the last event data
        mergedEventsData[len-1].endTime = new Date(Math.max(mergedEventsData[len-1].endTime.getTime(), eventData.endTime.getTime()));
        mergedEventsData[len-1].title += ` / ${event.title}`;
        mergedEventsData[len-1].description += ` / ${event.description}`;
        mergedEventsData[len-1].inviteesId = [...new Set([
          ...mergedEventsData[len-1].inviteesId, 
          ...eventData.inviteesId
        ])];

        // Also delete the current event
        await this.prisma.event.delete({ where: { id: event.id } });
      }
    }

    // Update the events based on the merged event data
    for (const eventData of mergedEventsData) {
      // Set the status of the event
      let status: Status = Status.TODO; // Default status
      const now = new Date();
      if (new Date(eventData.startTime) > now) {
        status = Status.TODO;
      } 
      else if (new Date(eventData.endTime) <= now) {
        status = Status.COMPLETED;
      } 
      else {
        status = Status.IN_PROGRESS;
      }
      
      // Update the data of the event
      await this.prisma.event.update({
        where: { id: eventData.id },
        data: {
          title: eventData.title,
          description: eventData.description,
          endTime: eventData.endTime,
          status: status,
          invitees: {
            set: [], // Clear existing invitees
            connect: eventData.inviteesId.map(id => ({ id: id })), // Reconnect merged invitees
          },
        },
      });

      // Also update the events of all related invitees
      eventData.inviteesId.forEach(async (inviteeId) => {
        await this.prisma.user.update({
          where: { id: inviteeId },
          data: { 
            events: {
              connect: {id: eventData.id}
            } 
          },
        }); 
      }); 
    }

    // Return the updated user data
    return await this.prisma.user.findUnique({
      where: { id: userId },
      include: { events: true }, 
    });
  }
}