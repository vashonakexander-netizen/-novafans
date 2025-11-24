import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { CreatePostDto, UpdatePostDto } from "./dto";
import { PostVisibility, PostStatus } from "@prisma/client";

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(creatorId: string, dto: CreatePostDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: creatorId },
    });

    if (!user || user.role !== "CREATOR") {
      throw new ForbiddenException("Not a creator");
    }

    const postData: any = {
      creatorId,
      title: dto.title,
      body: dto.body,
      visibility: dto.visibility || PostVisibility.PUBLIC_TEASER,
      price: dto.price,
      status: dto.publishAt ? PostStatus.SCHEDULED : PostStatus.DRAFT,
      publishAt: dto.publishAt,
    };

    if (!dto.publishAt) {
      postData.status = PostStatus.PUBLISHED;
    }

    const post = await this.prisma.post.create({
      data: postData,
      include: {
        media: true,
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });

    // Add media if provided
    if (dto.media && dto.media.length > 0) {
      await this.prisma.postMedia.createMany({
        data: dto.media.map((m) => ({
          postId: post.id,
          fileUrl: m.fileUrl,
          thumbnailUrl: m.thumbnailUrl,
          mediaType: m.mediaType,
          durationSeconds: m.durationSeconds,
        })),
      });
    }

    return this.findOne(post.id);
  }

  async update(postId: string, userId: string, dto: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException("Post not found");
    }

    if (post.creatorId !== userId) {
      throw new ForbiddenException("Not your post");
    }

    const updateData: any = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.body !== undefined) updateData.body = dto.body;
    if (dto.visibility !== undefined) updateData.visibility = dto.visibility;
    if (dto.price !== undefined) updateData.price = dto.price;
    if (dto.publishAt !== undefined) {
      updateData.publishAt = dto.publishAt;
      updateData.status = dto.publishAt ? PostStatus.SCHEDULED : PostStatus.PUBLISHED;
    }

    await this.prisma.post.update({
      where: { id: postId },
      data: updateData,
    });

    return this.findOne(postId);
  }

  async findOne(id: string, userId?: string) {
    const post = await this.prisma.post.findUnique({
      where: { id, isDeleted: false },
      include: {
        media: true,
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            creatorProfile: {
              select: {
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException("Post not found");
    }

    // Check if user has access
    if (post.visibility === PostVisibility.SUBSCRIBERS || post.visibility === PostVisibility.PAID) {
      if (!userId) {
        throw new ForbiddenException("Authentication required");
      }

      // Check subscription for SUBSCRIBERS
      if (post.visibility === PostVisibility.SUBSCRIBERS) {
        const subscription = await this.prisma.subscription.findFirst({
          where: {
            fanId: userId,
            creatorId: post.creatorId,
            status: "ACTIVE",
          },
        });

        if (!subscription) {
          throw new ForbiddenException("Subscription required");
        }
      }

      // Check purchase for PAID posts
      if (post.visibility === PostVisibility.PAID && post.price && post.price.toNumber() > 0) {
        const purchase = await this.prisma.purchase.findFirst({
          where: {
            userId,
            postId: post.id,
          },
        });

        if (!purchase) {
          // Don't throw, just mark as not purchased
          return { ...post, purchased: false };
        }

        return { ...post, purchased: true };
      }
    }

    return post;
  }

  async findByCreator(creatorId: string, userId?: string) {
    const posts = await this.prisma.post.findMany({
      where: {
        creatorId,
        isDeleted: false,
        OR: [
          { visibility: PostVisibility.PUBLIC_TEASER },
          { visibility: PostVisibility.SUBSCRIBERS },
          { visibility: PostVisibility.PAID },
        ],
      },
      include: {
        media: {
          take: 1, // Just get first media for thumbnail
        },
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    // Filter based on access
    const accessiblePosts = [];
    for (const post of posts) {
      if (post.visibility === PostVisibility.PUBLIC_TEASER) {
        accessiblePosts.push(post);
        continue;
      }

      if (!userId) {
        // Skip locked posts if not logged in
        continue;
      }

      if (post.visibility === PostVisibility.SUBSCRIBERS) {
        const subscription = await this.prisma.subscription.findFirst({
          where: {
            fanId: userId,
            creatorId: post.creatorId,
            status: "ACTIVE",
          },
        });

        if (subscription) {
          accessiblePosts.push(post);
        }
      }

      if (post.visibility === PostVisibility.PAID) {
        const purchase = await this.prisma.purchase.findFirst({
          where: {
            userId,
            postId: post.id,
          },
        });

        if (purchase) {
          accessiblePosts.push({ ...post, purchased: true });
        } else {
          // Show teaser for unpaid posts
          accessiblePosts.push({ ...post, purchased: false });
        }
      }
    }

    return accessiblePosts;
  }

  async delete(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException("Post not found");
    }

    if (post.creatorId !== userId) {
      throw new ForbiddenException("Not your post");
    }

    await this.prisma.post.update({
      where: { id: postId },
      data: { isDeleted: true },
    });

    return { success: true };
  }
}

