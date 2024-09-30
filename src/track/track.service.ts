import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from 'src/schemas/comment.schema';
import { Track, TrackDocument } from 'src/schemas/track.schema';

@Injectable()
export class TrackService {
  constructor(
    @InjectModel(Track.name) private trackModel: Model<TrackDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}
  async create() {
    return 'Track created successfully!';
  }

  async getAll() {
    return 'All tracks retrieved successfully!';
  }

  async getOne() {
    return 'Track retrieved successfully!';
  }

  async delete() {
    return 'Track deleted successfully!';
  }
}
