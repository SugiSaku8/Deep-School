import { Document } from 'mongoose';
export type PostDocument = Post & Document;
export declare class Post {
    PostId: string;
    PostName: string;
    PostTime: string;
    UserName: string;
    UserId: string;
    PostData: string;
    LikerData: string;
    LinkerData: any[];
}
export declare const PostSchema: any;
