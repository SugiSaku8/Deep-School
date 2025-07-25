// src/posts/posts.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { Poid } from '../utils/poid';
import { Filter } from 'profanity-check'; // profanity-checkをインポート
const df = new Filter({languages: ["japanese", "english", "french"]})
@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {}

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
    return { message: 'The post was successful!', post: createdPost };
  }

  async getAllPosts(): Promise<Post[]> {
    return await this.postModel.find().sort({ PostTime: -1 }).limit(25).exec();
  }

  async getPostByQuery(query: string): Promise<Post | null> {
    return await this.postModel.findOne({ PostId: query }).exec();
  }

  // 悪口をスキャンするメソッド
  async scanAndMaskProfanity(): Promise<void> {
    const posts = await this.postModel.find().exec();
    for (const post of posts) {
      if (df.isProfane(post.PostData)) { // profanity-checkを使用
        const originalText = post.PostData;
        await this.postModel.deleteOne({ PostId: post.PostId }); // 投稿を削除
        console.log(`Post ID: ${post.PostId} has been removed. Original: ${originalText}`);
      }
    }
  }

  // ユーザー入力を正規表現に使う前にエスケープ
  private escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  async searchPosts(query: string): Promise<Post[]> {
    // 入力値を正規表現としてエスケープ
    const safeQuery = this.escapeRegExp(query);
    const regex = new RegExp(safeQuery, 'i');
    return await this.postModel.find({
      $or: [
        { PostName: regex },
        { PostData: regex }
      ]
    }).sort({ PostTime: -1 }).limit(25).exec();
  }
}