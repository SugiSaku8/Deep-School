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
      await this.postsService.createPost(createPostDto);
      return { message: 'The post was successful!' };
    } catch (error) {
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
      throw new HttpException(
        {
          message: 'Failed to get posts.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('user/:userId')
  async getPostsByUserId(@Param('userId') userId: string) {
    try {
      return await this.postsService.getPostsByUserId(userId);
    } catch (error) {
      throw new HttpException(
        {
          message: 'Failed to get user posts.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('post/:postId')
  async updatePost(
    @Param('postId') postId: string,
    @Body() updateData: Partial<PostModel>,
  ) {
    try {
      return await this.postsService.updatePost(postId, updateData);
    } catch (error) {
      throw new HttpException(
        {
          message: 'Failed to update post.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('post/:postId')
  async deletePost(@Param('postId') postId: string) {
    try {
      await this.postsService.deletePost(postId);
      return { message: 'Post deleted successfully!' };
    } catch (error) {
      throw new HttpException(
        {
          message: 'Failed to delete post.',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}