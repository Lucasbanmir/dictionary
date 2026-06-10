import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

const DICT_API = 'https://api.dictionaryapi.dev/api/v2/entries/en';
const CACHE_TTL = 3600;

@Injectable()
export class EntriesService {
  private readonly logger = new Logger(EntriesService.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async listWords(params: { search?: string; limit: number; page: number }) {
    const { search, limit, page } = params;
    const skip = (page - 1) * limit;

    const where = search
      ? { word: { contains: search, mode: 'insensitive' as const } }
      : {};

    const [total, words] = await Promise.all([
      this.prisma.word.count({ where }),
      this.prisma.word.findMany({
        where,
        orderBy: { word: 'asc' },
        skip,
        take: limit,
        select: { word: true },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      results: words.map((w) => w.word),
      totalDocs: total,
      page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  async getWordDetails(word: string, userId: string) {
    const cacheKey = `dict:en:${word.toLowerCase()}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      await this.saveToHistory(word, userId);
      return JSON.parse(cached);
    }

    try {
      const response = await axios.get(`${DICT_API}/${word}`);
      const data = response.data;

      await this.redis.set(cacheKey, JSON.stringify(data), CACHE_TTL);
      await this.saveToHistory(word, userId);

      return data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new NotFoundException({
          title: 'No Definitions Found',
          message: `Sorry, we couldn't find definitions for the word you were looking for.`,
          resolution:
            'You can try the search again at a later time or head to the web instead.',
        });
      }
      throw error;
    }
  }

  async addFavorite(word: string, userId: string) {
    await this.prisma.userWordFavorite.upsert({
      where: { userId_word: { userId, word } },
      update: {},
      create: { userId, word },
    });
  }

  async removeFavorite(word: string, userId: string) {
    await this.prisma.userWordFavorite.deleteMany({
      where: { userId, word },
    });
  }

  private async saveToHistory(word: string, userId: string) {
    try {
      await this.prisma.userWordHistory.create({
        data: { userId, word },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Failed to save history: ${message}`);
    }
  }
}
