import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Query,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { Post as PostModel } from './schemas/post.schema';

@Controller()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post('post')
  async createPost(@Body() createPostDto: CreatePostDto) {
    try {
      const result = await this.postsService.createPost(createPostDto);
      return result;
    } catch (error) {
      console.error('Create post error:', error);
      throw new HttpException(
        {
          message: 'Failed to post.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('get')
  async getPosts(@Query('text') query?: string) {
    try {
      if (!query) {
        return await this.postsService.getAllPosts();
      }
      return await this.postsService.getPostByQuery(query);
    } catch (error) {
      console.error('Get posts error:', error);
      if (!query) {
        return [];
      }
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
}