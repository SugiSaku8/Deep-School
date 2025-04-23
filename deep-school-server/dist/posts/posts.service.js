"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const post_schema_1 = require("./schemas/post.schema");
const poid_1 = require("../utils/poid");
let PostsService = class PostsService {
    constructor(postModel) {
        this.postModel = postModel;
        console.log('_______________________');
        console.log('__Deep-Schooler_Server_');
        console.log('___MongoDB_Service_____');
        console.log('_________init..________');
    }
    transformToLegacyFormat(post) {
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
    async createPost(createPostDto) {
        try {
            const postId = (0, poid_1.Poid)(createPostDto.UserId, createPostDto.PostTime);
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
        }
        catch (error) {
            console.error('Create post error:', error);
            throw error;
        }
    }
    async getAllPosts() {
        try {
            const posts = await this.postModel.find().exec();
            console.log(`Found ${posts.length} posts`);
            return posts.map(post => `_${post.PostId}`);
        }
        catch (error) {
            console.error('Get all posts error:', error);
            return [];
        }
    }
    async getPostByQuery(query) {
        try {
            const postId = query.startsWith('_') ? query.slice(1) : query;
            console.log('Searching for post with ID:', postId);
            const post = await this.postModel.findOne({ PostId: postId }).exec();
            if (!post) {
                console.log('Post not found for ID:', postId);
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
        }
        catch (error) {
            console.error('Post query error:', error);
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
    async getPostsByUserId(userId) {
        try {
            const posts = await this.postModel.find({ UserId: userId }).exec();
            return posts.map(post => this.transformToLegacyFormat(post));
        }
        catch (error) {
            console.error('Get posts by user ID error:', error);
            return [];
        }
    }
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(post_schema_1.Post.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], PostsService);
//# sourceMappingURL=posts.service.js.map