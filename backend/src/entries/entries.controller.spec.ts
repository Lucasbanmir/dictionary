import { Test, TestingModule } from "@nestjs/testing";
import { JwtModule } from "@nestjs/jwt";
import { EntriesController } from "./entries.controller";
import { EntriesService } from "./entries.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";

describe("EntriesController", () => {
  let controller: EntriesController;
  let entriesService: EntriesService;

  const mockEntriesService = {
    listWords: jest.fn(),
    getWordDetails: jest.fn(),
    addFavorite: jest.fn(),
    removeFavorite: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  const userId = "user-123";

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: "test" })],
      controllers: [EntriesController],
      providers: [
        {
          provide: EntriesService,
          useValue: mockEntriesService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<EntriesController>(EntriesController);
    entriesService = module.get<EntriesService>(EntriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("listWords", () => {
    it("should return paginated list of words without search", async () => {
      const expected = {
        results: ["apple", "banana", "cherry"],
        totalDocs: 100,
        page: 1,
        totalPages: 10,
        hasNext: true,
        hasPrev: false,
      };

      mockEntriesService.listWords.mockResolvedValue(expected);

      const result = await controller.listWords(undefined, "10", "1");

      expect(result).toEqual(expected);
      expect(entriesService.listWords).toHaveBeenCalledWith({
        search: undefined,
        limit: 10,
        page: 1,
      });
    });

    it("should return paginated list with search filter", async () => {
      const expected = {
        results: ["apple"],
        totalDocs: 1,
        page: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      };

      mockEntriesService.listWords.mockResolvedValue(expected);

      const result = await controller.listWords("apple", "10", "1");

      expect(result).toEqual(expected);
      expect(entriesService.listWords).toHaveBeenCalledWith({
        search: "apple",
        limit: 10,
        page: 1,
      });
    });

    it("should use default limit when not provided", async () => {
      const expected = {
        results: ["word1", "word2"],
        totalDocs: 50,
        page: 1,
        totalPages: 5,
        hasNext: true,
        hasPrev: false,
      };

      mockEntriesService.listWords.mockResolvedValue(expected);

      const result = await controller.listWords(undefined, undefined, "1");

      expect(result).toEqual(expected);
      expect(entriesService.listWords).toHaveBeenCalledWith({
        search: undefined,
        limit: 10,
        page: 1,
      });
    });

    it("should use default page when not provided", async () => {
      const expected = {
        results: ["word1", "word2"],
        totalDocs: 50,
        page: 1,
        totalPages: 5,
        hasNext: true,
        hasPrev: false,
      };

      mockEntriesService.listWords.mockResolvedValue(expected);

      const result = await controller.listWords(undefined, "20", undefined);

      expect(result).toEqual(expected);
      expect(entriesService.listWords).toHaveBeenCalledWith({
        search: undefined,
        limit: 20,
        page: 1,
      });
    });

    it("should handle pagination correctly", async () => {
      const expected = {
        results: ["word11", "word12"],
        totalDocs: 50,
        page: 2,
        totalPages: 5,
        hasNext: true,
        hasPrev: true,
      };

      mockEntriesService.listWords.mockResolvedValue(expected);

      const result = await controller.listWords(undefined, "10", "2");

      expect(result.page).toBe(2);
      expect(result.hasPrev).toBe(true);
      expect(result.hasNext).toBe(true);
    });
  });

  describe("getWordDetails", () => {
    it("should return word details successfully", async () => {
      const wordDetails = [
        {
          word: "hello",
          phonetic: "/həˈloʊ/",
          meanings: [
            {
              partOfSpeech: "interjection",
              definitions: [
                {
                  definition: "used as a greeting",
                  example: "hello, how are you?",
                },
              ],
            },
          ],
        },
      ];

      mockEntriesService.getWordDetails.mockResolvedValue(wordDetails);

      const result = await controller.getWordDetails("hello", userId);

      expect(result).toEqual(wordDetails);
      expect(entriesService.getWordDetails).toHaveBeenCalledWith(
        "hello",
        userId,
      );
    });

    it("should throw NotFoundException for word not found", async () => {
      const notFoundError = new Error("Not found");
      mockEntriesService.getWordDetails.mockRejectedValue(notFoundError);

      await expect(controller.getWordDetails("xyz123", userId)).rejects.toThrow(
        "Not found",
      );
      expect(entriesService.getWordDetails).toHaveBeenCalledWith(
        "xyz123",
        userId,
      );
    });

    it("should save word to history", async () => {
      const wordDetails = [
        {
          word: "test",
          meanings: [],
        },
      ];

      mockEntriesService.getWordDetails.mockResolvedValue(wordDetails);

      await controller.getWordDetails("test", userId);

      expect(entriesService.getWordDetails).toHaveBeenCalledWith(
        "test",
        userId,
      );
    });
  });

  describe("addFavorite", () => {
    it("should add word to favorites successfully", async () => {
      mockEntriesService.addFavorite.mockResolvedValue(undefined);

      const result = await controller.addFavorite("hello", userId);

      expect(result).toBeUndefined();
      expect(entriesService.addFavorite).toHaveBeenCalledWith("hello", userId);
    });

    it("should handle multiple favorite additions", async () => {
      mockEntriesService.addFavorite.mockResolvedValue(undefined);

      await controller.addFavorite("word1", userId);
      await controller.addFavorite("word2", userId);

      expect(entriesService.addFavorite).toHaveBeenCalledTimes(2);
      expect(entriesService.addFavorite).toHaveBeenNthCalledWith(
        1,
        "word1",
        userId,
      );
      expect(entriesService.addFavorite).toHaveBeenNthCalledWith(
        2,
        "word2",
        userId,
      );
    });

    it("should not throw error when adding duplicate favorite", async () => {
      mockEntriesService.addFavorite.mockResolvedValue(undefined);

      await controller.addFavorite("hello", userId);
      await controller.addFavorite("hello", userId);

      expect(entriesService.addFavorite).toHaveBeenCalledTimes(2);
    });
  });

  describe("removeFavorite", () => {
    it("should remove word from favorites successfully", async () => {
      mockEntriesService.removeFavorite.mockResolvedValue(undefined);

      const result = await controller.removeFavorite("hello", userId);

      expect(result).toBeUndefined();
      expect(entriesService.removeFavorite).toHaveBeenCalledWith(
        "hello",
        userId,
      );
    });

    it("should handle multiple favorite removals", async () => {
      mockEntriesService.removeFavorite.mockResolvedValue(undefined);

      await controller.removeFavorite("word1", userId);
      await controller.removeFavorite("word2", userId);

      expect(entriesService.removeFavorite).toHaveBeenCalledTimes(2);
      expect(entriesService.removeFavorite).toHaveBeenNthCalledWith(
        1,
        "word1",
        userId,
      );
      expect(entriesService.removeFavorite).toHaveBeenNthCalledWith(
        2,
        "word2",
        userId,
      );
    });

    it("should not throw error when removing non-existent favorite", async () => {
      mockEntriesService.removeFavorite.mockResolvedValue(undefined);

      const result = await controller.removeFavorite("nonexistent", userId);

      expect(result).toBeUndefined();
    });
  });
});
