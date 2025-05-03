import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { Poid } from '../utils/poid';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {
    console.log('_______________________');
    console.log('__Deep-Schooler_Server_');
    console.log('___MongoDB_Service_____');
    console.log('_________init..________');
  }

  private transformToLegacyFormat(post: any) {
    return {
      value: {
        PostId: { value: post.PostId },
        PostName: { value: post.PostName },
        PostTime: { value: post.PostTime },
        UserName: { value: post.UserName },
        UserId: { value: post.UserId },
        PostData: { value: post.PostData },
        LikerData: { value: post.LikerData },
        LinkerData: post.LinkerData || [],
      }
    };
  }

  async createPost(createPostDto: CreatePostDto): Promise<any> {
    try {
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
      console.log('Post created successfully:', postId);
      return { message: 'The post was successful!' };
    } catch (error) {
      console.error('Create post error:', error);
      throw error;
    }
  }

  async getAllPosts(): Promise<string[]> {
    try {
      const posts = await this.postModel.find().exec();
      console.log(`Found ${posts.length} posts`);
      return posts.map(post => `_${post.PostId}`);
    } catch (error) {
      console.error('Get all posts error:', error);
      return [];
    }
  }

  async getPostByQuery(query: string) {
    try {
      if (typeof query !== 'string') {
        console.error('Invalid query type. Expected string.');
        return {
          value: {
            PostId: { value: "" },
            PostName: { value: "" },
            PostTime: { value: "" },
            UserName: { value: "" },
            UserId: { value: "" },
            PostData: { value: "" },
            LikerData: { value: "" },
            LinkerData: [],
          }
        };
      }
      const postId = query.startsWith('_') ? query.slice(1) : query;
      console.log('Searching for post with ID:', postId);
      
      const post = await this.postModel.findOne({ PostId: postId }).exec();
      
      if (!post) {
        console.log('Post not found for ID:', postId);
        // 投稿が見つからない場合は空のデータを返す
        return {
          value: {
            PostId: { value: "" },
            PostName: { value: "" },
            PostTime: { value: "" },
            UserName: { value: "" },
            UserId: { value: "" },
            PostData: { value: "" },
            LikerData: { value: "" },
            LinkerData: [],
          }
        };
      }

      console.log('Post found:', post.PostId);
      return this.transformToLegacyFormat(post);
    } catch (error) {
      console.error('Post query error:', error);
      // エラーが発生した場合も空のデータを返す
      return {
        value: {
          PostId: { value: "" },
          PostName: { value: "" },
          PostTime: { value: "" },
          UserName: { value: "" },
          UserId: { value: "" },
          PostData: { value: "" },
          LikerData: { value: "" },
          LinkerData: [],
        }
      };
    }
  }

  async getPostsByUserId(userId: string): Promise<any[]> {
    try {
      const posts = await this.postModel.find({ UserId: userId }).exec();
      return posts.map(post => this.transformToLegacyFormat(post));
    } catch (error) {
      console.error('Get posts by user ID error:', error);
      return [];
    }
  }
}