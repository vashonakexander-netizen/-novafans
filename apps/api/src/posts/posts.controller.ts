import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { CreatePostDto, UpdatePostDto } from "./dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { OptionalJwtGuard } from "../common/guards/optional-jwt.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { UserRole } from "@prisma/client";

@Controller("posts")
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR)
  async create(@CurrentUser() user: any, @Body() dto: CreatePostDto) {
    return this.postsService.create(user.id, dto);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR)
  async update(@Param("id") id: string, @CurrentUser() user: any, @Body() dto: UpdatePostDto) {
    return this.postsService.update(id, user.id, dto);
  }

  @Get(":id")
  @UseGuards(OptionalJwtGuard)
  async findOne(@Param("id") id: string, @CurrentUser() user?: any) {
    return this.postsService.findOne(id, user?.id);
  }

  @Get("creators/:creatorId/posts")
  @UseGuards(OptionalJwtGuard)
  async findByCreator(@Param("creatorId") creatorId: string, @CurrentUser() user?: any) {
    return this.postsService.findByCreator(creatorId, user?.id);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CREATOR)
  async delete(@Param("id") id: string, @CurrentUser() user: any) {
    return this.postsService.delete(id, user.id);
  }
}

