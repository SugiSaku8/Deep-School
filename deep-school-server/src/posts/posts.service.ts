import { Injectable } from '@nestjs/common';
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

  private transformToLegacyFormat(post: Post) {
    return {
      value: {
        PostId: { value: post.PostId },
        PostName: { value: post.PostName },
        PostTime: { value: post.PostTime },
        UserName: { value: post.UserName },
        UserId: { value: post.UserId },
        PostData: { value: post.PostData },
        LikerData: { value: post.LikerData },
        LinkerData: post.LinkerData,
      }
    };
  }

  async createPost(createPostDto: CreatePostDto): Promise<Post> {
    const postId = Poid(createPostDto.UserId, createPostDto.PostTime);

    const createdPost = new this.postModel({
      PostId: postId,
      PostName: createPostDto.PostName,
      PostTime: createPostDto.PostTime,
      UserName: createPostDto.UserName,
      UserId: createPostDto.UserId,
      PostData: createPostDto.PostData,
      LikerData: createPostDto.Genre,
      LinkerData: createPostDto.LinkerData,
    });

    return createdPost.save();
  }

  async getAllPosts(): Promise<string[]> {
    const posts = await this.postModel.find().exec();
    return posts.map(post => `_${post.PostId}`);
  }

  async getPostByQuery(query: string) {
    const postId = query.startsWith('_') ? query.slice(1) : query;
    const post = await this.postModel.findOne({ PostId: postId }).exec();
    if (!post) {
      throw new Error('Post not found');
    }
    return this.transformToLegacyFormat(post);
  }

  async getPostsByUserId(userId: string): Promise<Post[]> {
    return this.postModel.find({ UserId: userId }).exec();
  }

  async updatePost(postId: string, updateData: Partial<Post>): Promise<Post> {
    return this.postModel
      .findOneAndUpdate({ PostId: postId }, updateData, { new: true })
      .exec();
  }

  async deletePost(postId: string): Promise<Post> {
    return this.postModel.findOneAndDelete({ PostId: postId }).exec();
  }
}