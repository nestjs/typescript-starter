/**
 * Define schema for document in MongoDB
 */

import * as mongoose from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type taskDoc = mongoose.HydratedDocument<Task>;


@Schema()
export class Task {
    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, auto: true })
    _id: string;

    @Prop({ type: String, required: true })
    title: string;

    @Prop({ type: String, required: false })
    description: string;

    @Prop({ type: String, required: true, enum: ['TODO', 'IN_PROGRESS', 'COMPLETED'] })
    status: string;

    @Prop({ type: Date, required: true, auto: true, default: Date.now() })
    createdAt: Date;

    @Prop({ type: Date, required: true, default: Date.now() })
    updatedAt: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);