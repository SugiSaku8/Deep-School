// src/posts/posts.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { Poid } from '../utils/poid';
import { Filter } from 'profanity-filter'; // 修正: 名前付きエクスポートを使用
@Injectable()
export class PostsService {
  private filter: any; // 型をanyに変更

  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {
    this.filter = new Filter(); // ここはそのまま
  }

  async createPost(createPostDto: CreatePostDto): Promise<any> {
    const postId = Poid(createPostDto.UserId, createPostDto.PostTime);
    const postData = {
      PostId: postId,
      PostName: createPostDto.PostName,
      PostTime: createPostDto.PostTime,
      UserName: createPostDto.UserName,
      UserId: createPostDto.UserId,
      PostData: createPostDto.PostData,
      LikerData: createPostDto.Genre,
      LinkerData: createPostDto.LinkerData || [],
    };

    const createdPost = new this.postModel(postData);
    await createdPost.save();
    return { message: 'The post was successful!' };
  }

  async getAllPosts(): Promise<Post[]> {
    return await this.postModel.find().exec();
  }

  async getPostByQuery(query: string): Promise<Post | null> {
    return await this.postModel.findOne({ PostId: query }).exec();
  }

  // 悪口をスキャンするメソッド
  async scanAndMaskProfanity(): Promise<void> {
    const posts = await this.postModel.find().exec();
    for (const post of posts) {
      if (this.filter.isProfane(post.PostData)) {
        const originalText = post.PostData;
        post.PostData = this.filter.clean(post.PostData);
        await post.save();
        console.log(`Post ID: ${post.PostId} has been masked. Original: ${originalText}`);
      }
    }
  }
}