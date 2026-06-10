import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async getHistory(userId: string, params: { limit: number; page: number }) {
    const { limit, page } = params;
    const skip = (page - 1) * limit;

    const [total, history] = await Promise.all([
      this.prisma.userWordHistory.count({ where: { userId } }),
      this.prisma.userWordHistory.findMany({
        where: { userId },
        orderBy: { added: 'desc' },
        skip,
        take: limit,
        select: { word: true, added: true },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      results: history.map((h) => ({
        word: h.word,
        added: h.added.toISOString(),
      })),
      totalDocs: total,
      page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  async getFavorites(userId: string, params: { limit: number; page: number }) {
    const { limit, page } = params;
    const skip = (page - 1) * limit;

    const [total, favorites] = await Promise.all([
      this.prisma.userWordFavorite.count({ where: { userId } }),
      this.prisma.userWordFavorite.findMany({
        where: { userId },
        orderBy: { added: 'desc' },
        skip,
        take: limit,
        select: { word: true, added: true },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      results: favorites.map((f) => ({
        word: f.word,
        added: f.added.toISOString(),
      })),
      totalDocs: total,
      page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  async clearHistory(userId: string) {
    await this.prisma.userWordHistory.deleteMany({ where: { userId } });
  }
}
