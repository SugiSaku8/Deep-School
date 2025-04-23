import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PostDocument = Post & Document;

@Schema()
export class Post {
  @Prop({ required: true })
  PostId: string;

  @Prop({ required: true })
  PostName: string;

  @Prop({ required: true })
  PostTime: string;

  @Prop({ required: true })
  UserName: string;

  @Prop({ required: true })
  UserId: string;

  @Prop({ required: true })
  PostData: string;

  @Prop()
  LikerData: string;

  @Prop()
  LinkerData: string;
}

export const PostSchema = SchemaFactory.createForClass(Post);