import { Model } from 'mongoose';
import { PostDocument } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
export declare class PostsService {
    private postModel;
    constructor(postModel: Model<PostDocument>);
    private transformToLegacyFormat;
    createPost(createPostDto: CreatePostDto): Promise<any>;
    getAllPosts(): Promise<string[]>;
    getPostByQuery(query: string): Promise<{
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
    getPostsByUserId(userId: string): Promise<any[]>;
}
