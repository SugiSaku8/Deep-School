import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
export declare class PostsController {
    private readonly postsService;
    constructor(postsService: PostsService);
    createPost(createPostDto: CreatePostDto): Promise<any>;
    getPosts(query?: string): Promise<string[] | {
        value: {
            PostId: {
                value: any;
            };
            PostName: {
                value: any;
            };
            PostTime: {
                value: any;
            };
            UserName: {
                value: any;
            };
            UserId: {
                value: any;
            };
            PostData: {
                value: any;
            };
            LikerData: {
                value: any;
            };
            LinkerData: any;
        };
    }>;
}
