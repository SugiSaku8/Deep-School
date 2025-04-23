import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  UserName: string;

  @IsString()
  @IsNotEmpty()
  UserId: string;

  @IsString()
  @IsNotEmpty()
  PostName: string;

  @IsString()
  @IsNotEmpty()
  PostTime: string;

  @IsString()
  @IsNotEmpty()
  PostData: string;

  @IsString()
  @IsNotEmpty()
  Genre: string;

  @IsOptional()
  LinkerData: any[];
}