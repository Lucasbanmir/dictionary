import { Test, TestingModule } from "@nestjs/testing";
import { JwtModule } from "@nestjs/jwt";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";

describe("UserController", () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    getProfile: jest.fn(),
    getHistory: jest.fn(),
    getFavorites: jest.fn(),
    clearHistory: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  const userId = "user-123";

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: "test" })],
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getProfile", () => {
    it("should return user profile", async () => {
      const profile = {
        id: userId,
        name: "John Doe",
        email: "john@example.com",
      };

      mockUserService.getProfile.mockResolvedValue(profile);

      const result = await controller.getProfile(userId);

      expect(result).toEqual(profile);
      expect(userService.getProfile).toHaveBeenCalledWith(userId);
    });

    it("should throw NotFoundException when user not found", async () => {
      const error = new Error("User not found");
      mockUserService.getProfile.mockRejectedValue(error);

      await expect(controller.getProfile("invalid-user")).rejects.toThrow(
        "User not found",
      );
      expect(userService.getProfile).toHaveBeenCalledWith("invalid-user");
    });

    it("should return only id, name, and email fields", async () => {
      const profile = {
        id: userId,
        name: "Jane Doe",
        email: "jane@example.com",
      };

      mockUserService.getProfile.mockResolvedValue(profile);

      const result = await controller.getProfile(userId);

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("email");
      expect(Object.keys(result).length).toBe(3);
    });
  });

  describe("getHistory", () => {
    it("should return user word history with pagination", async () => {
      const expected = {
        results: [
          { word: "hello", added: "2024-01-10T12:00:00.000Z" },
          { word: "world", added: "2024-01-09T12:00:00.000Z" },
        ],
        totalDocs: 50,
        page: 1,
        totalPages: 5,
        hasNext: true,
        hasPrev: false,
      };

      mockUserService.getHistory.mockResolvedValue(expected);

      const result = await controller.getHistory(userId, "10", "1");

      expect(result).toEqual(expected);
      expect(userService.getHistory).toHaveBeenCalledWith(userId, {
        limit: 10,
        page: 1,
      });
    });

    it("should use default limit when not provided", async () => {
      const expected = {
        results: [],
        totalDocs: 0,
        page: 1,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      };

      mockUserService.getHistory.mockResolvedValue(expected);

      const result = await controller.getHistory(userId, undefined, "1");

      expect(userService.getHistory).toHaveBeenCalledWith(userId, {
        limit: 10,
        page: 1,
      });
    });

    it("should use default page when not provided", async () => {
      const expected = {
        results: [],
        totalDocs: 0,
        page: 1,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      };

      mockUserService.getHistory.mockResolvedValue(expected);

      const result = await controller.getHistory(userId, "20", undefined);

      expect(userService.getHistory).toHaveBeenCalledWith(userId, {
        limit: 20,
        page: 1,
      });
    });

    it("should handle pagination on different pages", async () => {
      const expected = {
        results: [],
        totalDocs: 50,
        page: 3,
        totalPages: 5,
        hasNext: true,
        hasPrev: true,
      };

      mockUserService.getHistory.mockResolvedValue(expected);

      const result = await controller.getHistory(userId, "10", "3");

      expect(result.page).toBe(3);
      expect(result.hasPrev).toBe(true);
      expect(result.hasNext).toBe(true);
    });
  });

  describe("getFavorites", () => {
    it("should return user favorite words with pagination", async () => {
      const expected = {
        results: [
          { word: "amazing", added: "2024-01-10T12:00:00.000Z" },
          { word: "beautiful", added: "2024-01-09T12:00:00.000Z" },
        ],
        totalDocs: 25,
        page: 1,
        totalPages: 3,
        hasNext: true,
        hasPrev: false,
      };

      mockUserService.getFavorites.mockResolvedValue(expected);

      const result = await controller.getFavorites(userId, "10", "1");

      expect(result).toEqual(expected);
      expect(userService.getFavorites).toHaveBeenCalledWith(userId, {
        limit: 10,
        page: 1,
      });
    });

    it("should use default limit when not provided", async () => {
      const expected = {
        results: [],
        totalDocs: 0,
        page: 1,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      };

      mockUserService.getFavorites.mockResolvedValue(expected);

      const result = await controller.getFavorites(userId, undefined, "1");

      expect(userService.getFavorites).toHaveBeenCalledWith(userId, {
        limit: 10,
        page: 1,
      });
    });

    it("should use default page when not provided", async () => {
      const expected = {
        results: [],
        totalDocs: 0,
        page: 1,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      };

      mockUserService.getFavorites.mockResolvedValue(expected);

      const result = await controller.getFavorites(userId, "20", undefined);

      expect(userService.getFavorites).toHaveBeenCalledWith(userId, {
        limit: 20,
        page: 1,
      });
    });

    it("should return empty results when user has no favorites", async () => {
      const expected = {
        results: [],
        totalDocs: 0,
        page: 1,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      };

      mockUserService.getFavorites.mockResolvedValue(expected);

      const result = await controller.getFavorites(userId, "10", "1");

      expect(result.results).toEqual([]);
      expect(result.totalDocs).toBe(0);
    });
  });

  describe("clearHistory", () => {
    it("should clear user history successfully", async () => {
      mockUserService.clearHistory.mockResolvedValue(undefined);

      const result = await controller.clearHistory(userId);

      expect(result).toBeUndefined();
      expect(userService.clearHistory).toHaveBeenCalledWith(userId);
    });

    it("should accept any userId", async () => {
      const differentUserId = "user-456";
      mockUserService.clearHistory.mockResolvedValue(undefined);

      await controller.clearHistory(differentUserId);

      expect(userService.clearHistory).toHaveBeenCalledWith(differentUserId);
    });

    it("should not throw error even if history is already empty", async () => {
      mockUserService.clearHistory.mockResolvedValue(undefined);

      const result = await controller.clearHistory(userId);

      expect(result).toBeUndefined();
    });
  });
});
