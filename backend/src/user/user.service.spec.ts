import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { UserService } from "./user.service";
import { PrismaService } from "../prisma/prisma.service";

jest.mock("../prisma/prisma.service");

describe("UserService", () => {
  let userService: UserService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    userWordHistory: {
      count: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    userWordFavorite: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getProfile", () => {
    const userId = "user-123";

    it("should return user profile", async () => {
      const mockUser = {
        id: userId,
        name: "John Doe",
        email: "john@example.com",
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await userService.getProfile(userId);

      expect(result).toEqual(mockUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: { id: true, name: true, email: true },
      });
    });

    it("should throw NotFoundException when user not found", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(userService.getProfile(userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(userService.getProfile(userId)).rejects.toThrow(
        "User not found",
      );
    });

    it("should select only specific fields", async () => {
      const mockUser = {
        id: userId,
        name: "Jane Doe",
        email: "jane@example.com",
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await userService.getProfile(userId);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: { id: true, name: true, email: true },
      });
    });
  });

  describe("getHistory", () => {
    const userId = "user-123";

    it("should return paginated word history", async () => {
      const mockHistory = [
        { word: "hello", added: new Date("2024-01-10") },
        { word: "world", added: new Date("2024-01-09") },
      ];

      mockPrismaService.userWordHistory.count.mockResolvedValue(50);
      mockPrismaService.userWordHistory.findMany.mockResolvedValue(mockHistory);

      const result = await userService.getHistory(userId, {
        limit: 10,
        page: 1,
      });

      expect(result.results).toHaveLength(2);
      expect(result.totalDocs).toBe(50);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(5);
      expect(result.hasNext).toBe(true);
      expect(result.hasPrev).toBe(false);

      expect(prismaService.userWordHistory.count).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(prismaService.userWordHistory.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { added: "desc" },
        skip: 0,
        take: 10,
        select: { word: true, added: true },
      });
    });

    it("should format dates to ISO string", async () => {
      const testDate = new Date("2024-01-10T12:00:00.000Z");
      const mockHistory = [{ word: "test", added: testDate }];

      mockPrismaService.userWordHistory.count.mockResolvedValue(1);
      mockPrismaService.userWordHistory.findMany.mockResolvedValue(mockHistory);

      const result = await userService.getHistory(userId, {
        limit: 10,
        page: 1,
      });

      expect(result.results[0].added).toBe(testDate.toISOString());
    });

    it("should calculate pagination for middle page", async () => {
      const mockHistory = Array(10)
        .fill(null)
        .map((_, i) => ({
          word: `word${i}`,
          added: new Date(),
        }));

      mockPrismaService.userWordHistory.count.mockResolvedValue(100);
      mockPrismaService.userWordHistory.findMany.mockResolvedValue(mockHistory);

      const result = await userService.getHistory(userId, {
        limit: 10,
        page: 3,
      });

      expect(result.page).toBe(3);
      expect(result.totalPages).toBe(10);
      expect(result.hasNext).toBe(true);
      expect(result.hasPrev).toBe(true);

      expect(prismaService.userWordHistory.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { added: "desc" },
        skip: 20,
        take: 10,
        select: { word: true, added: true },
      });
    });

    it("should calculate pagination for last page", async () => {
      const mockHistory = Array(10)
        .fill(null)
        .map((_, i) => ({
          word: `word${i}`,
          added: new Date(),
        }));

      mockPrismaService.userWordHistory.count.mockResolvedValue(25);
      mockPrismaService.userWordHistory.findMany.mockResolvedValue(mockHistory);

      const result = await userService.getHistory(userId, {
        limit: 10,
        page: 3,
      });

      expect(result.page).toBe(3);
      expect(result.totalPages).toBe(3);
      expect(result.hasNext).toBe(false);
      expect(result.hasPrev).toBe(true);
    });

    it("should return empty results when no history", async () => {
      mockPrismaService.userWordHistory.count.mockResolvedValue(0);
      mockPrismaService.userWordHistory.findMany.mockResolvedValue([]);

      const result = await userService.getHistory(userId, {
        limit: 10,
        page: 1,
      });

      expect(result.results).toEqual([]);
      expect(result.totalDocs).toBe(0);
      expect(result.totalPages).toBe(0);
    });
  });

  describe("getFavorites", () => {
    const userId = "user-123";

    it("should return paginated favorites list", async () => {
      const mockFavorites = [
        { word: "amazing", added: new Date("2024-01-10") },
        { word: "beautiful", added: new Date("2024-01-09") },
      ];

      mockPrismaService.userWordFavorite.count.mockResolvedValue(25);
      mockPrismaService.userWordFavorite.findMany.mockResolvedValue(
        mockFavorites,
      );

      const result = await userService.getFavorites(userId, {
        limit: 10,
        page: 1,
      });

      expect(result.results).toHaveLength(2);
      expect(result.totalDocs).toBe(25);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(3);
      expect(result.hasNext).toBe(true);
      expect(result.hasPrev).toBe(false);

      expect(prismaService.userWordFavorite.count).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(prismaService.userWordFavorite.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { added: "desc" },
        skip: 0,
        take: 10,
        select: { word: true, added: true },
      });
    });

    it("should format dates to ISO string", async () => {
      const testDate = new Date("2024-01-10T12:00:00.000Z");
      const mockFavorites = [{ word: "favorite", added: testDate }];

      mockPrismaService.userWordFavorite.count.mockResolvedValue(1);
      mockPrismaService.userWordFavorite.findMany.mockResolvedValue(
        mockFavorites,
      );

      const result = await userService.getFavorites(userId, {
        limit: 10,
        page: 1,
      });

      expect(result.results[0].added).toBe(testDate.toISOString());
    });

    it("should calculate pagination for middle page", async () => {
      const mockFavorites = Array(10)
        .fill(null)
        .map((_, i) => ({
          word: `word${i}`,
          added: new Date(),
        }));

      mockPrismaService.userWordFavorite.count.mockResolvedValue(50);
      mockPrismaService.userWordFavorite.findMany.mockResolvedValue(
        mockFavorites,
      );

      const result = await userService.getFavorites(userId, {
        limit: 10,
        page: 2,
      });

      expect(result.page).toBe(2);
      expect(result.totalPages).toBe(5);
      expect(result.hasNext).toBe(true);
      expect(result.hasPrev).toBe(true);

      expect(prismaService.userWordFavorite.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { added: "desc" },
        skip: 10,
        take: 10,
        select: { word: true, added: true },
      });
    });

    it("should return empty results when no favorites", async () => {
      mockPrismaService.userWordFavorite.count.mockResolvedValue(0);
      mockPrismaService.userWordFavorite.findMany.mockResolvedValue([]);

      const result = await userService.getFavorites(userId, {
        limit: 10,
        page: 1,
      });

      expect(result.results).toEqual([]);
      expect(result.totalDocs).toBe(0);
      expect(result.totalPages).toBe(0);
      expect(result.hasNext).toBe(false);
      expect(result.hasPrev).toBe(false);
    });
  });

  describe("clearHistory", () => {
    const userId = "user-123";

    it("should delete all history records for user", async () => {
      mockPrismaService.userWordHistory.deleteMany.mockResolvedValue({
        count: 15,
      });

      await userService.clearHistory(userId);

      expect(prismaService.userWordHistory.deleteMany).toHaveBeenCalledWith({
        where: { userId },
      });
    });

    it("should work even if history is empty", async () => {
      mockPrismaService.userWordHistory.deleteMany.mockResolvedValue({
        count: 0,
      });

      await userService.clearHistory(userId);

      expect(prismaService.userWordHistory.deleteMany).toHaveBeenCalledWith({
        where: { userId },
      });
    });

    it("should handle multiple clear operations", async () => {
      mockPrismaService.userWordHistory.deleteMany.mockResolvedValue({
        count: 0,
      });

      await userService.clearHistory(userId);
      await userService.clearHistory(userId);

      expect(prismaService.userWordHistory.deleteMany).toHaveBeenCalledTimes(2);
    });
  });
});
