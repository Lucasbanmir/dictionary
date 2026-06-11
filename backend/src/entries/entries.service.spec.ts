import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException, Logger } from "@nestjs/common";
import axios from "axios";
import { EntriesService } from "./entries.service";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";

jest.mock("axios");
jest.mock("../prisma/prisma.service");
jest.mock("../redis/redis.service");

describe("EntriesService", () => {
  let entriesService: EntriesService;
  let prismaService: PrismaService;
  let redisService: RedisService;

  const mockPrismaService = {
    word: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    userWordFavorite: {
      upsert: jest.fn(),
      deleteMany: jest.fn(),
    },
    userWordHistory: {
      create: jest.fn(),
    },
  };

  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntriesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    entriesService = module.get<EntriesService>(EntriesService);
    prismaService = module.get<PrismaService>(PrismaService);
    redisService = module.get<RedisService>(RedisService);

    // Mock Logger to avoid console output
    jest.spyOn(Logger.prototype, "warn").mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("listWords", () => {
    it("should return paginated list of words", async () => {
      const mockWords = [{ word: "apple" }, { word: "banana" }];

      mockPrismaService.word.count.mockResolvedValue(100);
      mockPrismaService.word.findMany.mockResolvedValue(mockWords);

      const result = await entriesService.listWords({
        search: undefined,
        limit: 10,
        page: 1,
      });

      expect(result.results).toEqual(["apple", "banana"]);
      expect(result.totalDocs).toBe(100);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(10);
      expect(result.hasNext).toBe(true);
      expect(result.hasPrev).toBe(false);

      expect(prismaService.word.count).toHaveBeenCalledWith({ where: {} });
      expect(prismaService.word.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { word: "asc" },
        skip: 0,
        take: 10,
        select: { word: true },
      });
    });

    it("should filter words by search query", async () => {
      const mockWords = [{ word: "apple" }];

      mockPrismaService.word.count.mockResolvedValue(1);
      mockPrismaService.word.findMany.mockResolvedValue(mockWords);

      const result = await entriesService.listWords({
        search: "apple",
        limit: 10,
        page: 1,
      });

      expect(result.results).toEqual(["apple"]);

      expect(prismaService.word.count).toHaveBeenCalledWith({
        where: { word: { contains: "apple", mode: "insensitive" } },
      });
    });

    it("should calculate pagination correctly for middle page", async () => {
      const mockWords = Array(10)
        .fill(null)
        .map((_, i) => ({ word: `word${i}` }));

      mockPrismaService.word.count.mockResolvedValue(50);
      mockPrismaService.word.findMany.mockResolvedValue(mockWords);

      const result = await entriesService.listWords({
        search: undefined,
        limit: 10,
        page: 2,
      });

      expect(result.page).toBe(2);
      expect(result.totalPages).toBe(5);
      expect(result.hasNext).toBe(true);
      expect(result.hasPrev).toBe(true);

      expect(prismaService.word.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { word: "asc" },
        skip: 10,
        take: 10,
        select: { word: true },
      });
    });

    it("should calculate pagination correctly for last page", async () => {
      const mockWords = Array(10)
        .fill(null)
        .map((_, i) => ({ word: `word${i}` }));

      mockPrismaService.word.count.mockResolvedValue(50);
      mockPrismaService.word.findMany.mockResolvedValue(mockWords);

      const result = await entriesService.listWords({
        search: undefined,
        limit: 10,
        page: 5,
      });

      expect(result.page).toBe(5);
      expect(result.totalPages).toBe(5);
      expect(result.hasNext).toBe(false);
      expect(result.hasPrev).toBe(true);
    });
  });

  describe("getWordDetails", () => {
    const wordDetails = [
      {
        word: "hello",
        phonetic: "/həˈloʊ/",
        meanings: [
          {
            partOfSpeech: "interjection",
            definitions: [{ definition: "used as greeting" }],
          },
        ],
      },
    ];

    const userId = "user-123";

    it("should return word details from cache if available", async () => {
      const cacheKey = "dict:en:hello";

      mockRedisService.get.mockResolvedValue(JSON.stringify(wordDetails));
      mockPrismaService.userWordHistory.create.mockResolvedValue({});

      const result = await entriesService.getWordDetails("hello", userId);

      expect(result).toEqual(wordDetails);
      expect(redisService.get).toHaveBeenCalledWith(cacheKey);
      expect(axios.get).not.toHaveBeenCalled();
      expect(prismaService.userWordHistory.create).toHaveBeenCalledWith({
        data: { userId, word: "hello" },
      });
    });

    it("should fetch from API if not cached", async () => {
      const cacheKey = "dict:en:hello";

      mockRedisService.get.mockResolvedValue(null);
      (axios.get as jest.Mock).mockResolvedValue({ data: wordDetails });
      mockRedisService.set.mockResolvedValue(true);
      mockPrismaService.userWordHistory.create.mockResolvedValue({});

      const result = await entriesService.getWordDetails("hello", userId);

      expect(result).toEqual(wordDetails);
      expect(redisService.get).toHaveBeenCalledWith(cacheKey);
      expect(axios.get).toHaveBeenCalledWith(
        "https://api.dictionaryapi.dev/api/v2/entries/en/hello",
      );
      expect(redisService.set).toHaveBeenCalledWith(
        cacheKey,
        JSON.stringify(wordDetails),
        3600,
      );
      expect(prismaService.userWordHistory.create).toHaveBeenCalledWith({
        data: { userId, word: "hello" },
      });
    });

    it("should throw NotFoundException when word not found in API", async () => {
      const cacheKey = "dict:en:xyz123";
      const error = new Error("Not Found");
      (error as any).response = { status: 404 };

      mockRedisService.get.mockResolvedValue(null);
      (axios.get as jest.Mock).mockRejectedValue(error);
      (axios.isAxiosError as unknown as jest.Mock).mockReturnValue(true);

      await expect(
        entriesService.getWordDetails("xyz123", userId),
      ).rejects.toThrow(NotFoundException);

      expect(redisService.get).toHaveBeenCalledWith(cacheKey);
    });

    it("should save word to history after fetching", async () => {
      mockRedisService.get.mockResolvedValue(null);
      (axios.get as jest.Mock).mockResolvedValue({ data: wordDetails });
      mockRedisService.set.mockResolvedValue(true);
      mockPrismaService.userWordHistory.create.mockResolvedValue({});

      await entriesService.getWordDetails("hello", userId);

      expect(prismaService.userWordHistory.create).toHaveBeenCalledWith({
        data: { userId, word: "hello" },
      });
    });

    it("should handle case-insensitive cache key", async () => {
      mockRedisService.get.mockResolvedValue(JSON.stringify(wordDetails));
      mockPrismaService.userWordHistory.create.mockResolvedValue({});

      await entriesService.getWordDetails("HELLO", userId);

      expect(redisService.get).toHaveBeenCalledWith("dict:en:hello");
    });
  });

  describe("addFavorite", () => {
    it("should add word to favorites", async () => {
      const word = "hello";
      const userId = "user-123";

      mockPrismaService.userWordFavorite.upsert.mockResolvedValue({
        userId,
        word,
      });

      await entriesService.addFavorite(word, userId);

      expect(prismaService.userWordFavorite.upsert).toHaveBeenCalledWith({
        where: { userId_word: { userId, word } },
        update: {},
        create: { userId, word },
      });
    });

    it("should not duplicate when adding favorite that already exists", async () => {
      const word = "hello";
      const userId = "user-123";

      mockPrismaService.userWordFavorite.upsert.mockResolvedValue({
        userId,
        word,
      });

      await entriesService.addFavorite(word, userId);
      await entriesService.addFavorite(word, userId);

      expect(prismaService.userWordFavorite.upsert).toHaveBeenCalledTimes(2);
    });
  });

  describe("removeFavorite", () => {
    it("should remove word from favorites", async () => {
      const word = "hello";
      const userId = "user-123";

      mockPrismaService.userWordFavorite.deleteMany.mockResolvedValue({
        count: 1,
      });

      await entriesService.removeFavorite(word, userId);

      expect(prismaService.userWordFavorite.deleteMany).toHaveBeenCalledWith({
        where: { userId, word },
      });
    });

    it("should handle removal when favorite does not exist", async () => {
      const word = "nonexistent";
      const userId = "user-123";

      mockPrismaService.userWordFavorite.deleteMany.mockResolvedValue({
        count: 0,
      });

      await entriesService.removeFavorite(word, userId);

      expect(prismaService.userWordFavorite.deleteMany).toHaveBeenCalledWith({
        where: { userId, word },
      });
    });
  });

  describe("saveToHistory", () => {
    it("should save word to history", async () => {
      const word = "hello";
      const userId = "user-123";

      mockPrismaService.userWordHistory.create.mockResolvedValue({
        id: "history-1",
        userId,
        word,
        createdAt: new Date(),
      });

      // Call private method through public method
      await entriesService.getWordDetails(word, userId);

      expect(prismaService.userWordHistory.create).toHaveBeenCalled();
    });

    it("should log warning if history save fails", async () => {
      const word = "hello";
      const userId = "user-123";
      const error = new Error("Database error");

      mockRedisService.get.mockResolvedValue(JSON.stringify([{ word }]));
      mockPrismaService.userWordHistory.create.mockRejectedValue(error);

      const warnSpy = jest.spyOn(Logger.prototype, "warn");

      await entriesService.getWordDetails(word, userId);

      expect(warnSpy).toHaveBeenCalled();
    });
  });
});
