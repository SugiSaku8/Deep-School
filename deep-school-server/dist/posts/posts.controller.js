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
exports.PostsController = void 0;
const common_1 = require("@nestjs/common");
const posts_service_1 = require("./posts.service");
const create_post_dto_1 = require("./dto/create-post.dto");
let PostsController = class PostsController {
    constructor(postsService) {
        this.postsService = postsService;
    }
    async createPost(createPostDto) {
        try {
            const result = await this.postsService.createPost(createPostDto);
            return result;
        }
        catch (error) {
            console.error('Create post error:', error);
            throw new common_1.HttpException({
                message: 'Failed to post.',
                error: error.message,
            }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getPosts(query) {
        try {
            if (!query) {
                return await this.postsService.getAllPosts();
            }
            return await this.postsService.getPostByQuery(query);
        }
        catch (error) {
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
};
exports.PostsController = PostsController;
__decorate([
    (0, common_1.Post)('post'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_post_dto_1.CreatePostDto]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "createPost", null);
__decorate([
    (0, common_1.Get)('get'),
    __param(0, (0, common_1.Query)('text')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "getPosts", null);
exports.PostsController = PostsController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [posts_service_1.PostsService])
], PostsController);
//# sourceMappingURL=posts.controller.js.map