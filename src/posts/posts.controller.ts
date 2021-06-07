import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import CreatePostDto from './dto/createPost.dto';
import UpdatePostDto from './dto/updatePost.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export default class PostsController {
    constructor(
        private readonly postsService: PostsService
    ) { }

    @Get()
    getAllPosts() {
        return this.postsService.getAllPosts();
    }

    @Get(':id')
    getPostById(@Param('id') id: string) {
        return this.postsService.getPostById(Number(id));
    }

    @Post()
    async createPost(@Body() post: CreatePostDto) {
        return this.postsService.createPost(post);
    }

    @Put(':id')
    async replacePost(@Param('id') id: string, @Body() post: UpdatePostDto) {
        return this.postsService.updatePost(Number(id), post);
    }

    @Delete(':id')
    async deletePost(@Param('id') id: string) {
        this.postsService.deletePost(Number(id));
    }
}