// src/posts/posts.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { Poid } from '../utils/poid';
import Filter from 'profanity-filter';

@Injectable()
export class PostsService {
  private filter: Filter;

  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {
    this.filter = new Filter();
    console.log('_______________________');
    console.log('__Deep-Schooler_Server_');
    console.log('___MongoDB_Service_____');
    console.log('_________init..________');
  }

  // 新しいメソッドを追加
  async scanAndMaskProfanity(): Promise<void> {
    const posts = await this.postModel.find().exec();
    for (const post of posts) {
      if (this.filter.isProfane(post.PostData)) {
        console.log(`Profanity detected in post ID: ${post.PostId}`);
        // 元のテキストを保存
        const originalText = post.PostData;
        // マスク処理
        post.PostData = this.filter.clean(post.PostData);
        await post.save();
        console.log(`Post ID: ${post.PostId} has been masked. Original: ${originalText}`);
      }
    }
  }
}