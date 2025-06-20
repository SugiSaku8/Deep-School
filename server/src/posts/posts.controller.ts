// src/posts/posts.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post('create')
  async createPost(@Body() createPostDto: CreatePostDto) {
    return await this.postsService.createPost(createPostDto);
  }

  @Get('all')
  async getAllPosts() {
    return await this.postsService.getAllPosts();
  }

  @Get('query')
  async getPostByQuery(@Query('text') query: string) {
    return await this.postsService.getPostByQuery(query);
  }

  @Get('search')
  async searchPosts(@Query('query') query: string) {
    return await this.postsService.searchPosts(query);
  }
}