import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EntriesService } from './entries.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Entries')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('entries/en')
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @Get()
  @ApiOperation({ summary: 'List all dictionary words with pagination' })
  @ApiQuery({ name: 'search', required: false, description: 'Filter by word' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiResponse({ status: 200, description: 'Returns paginated list of words' })
  async listWords(
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    return this.entriesService.listWords({
      search,
      limit: limit ? parseInt(limit, 10) : 10,
      page: page ? parseInt(page, 10) : 1,
    });
  }

  @Get(':word')
  @ApiOperation({ summary: 'Get word details from Free Dictionary API' })
  @ApiResponse({ status: 200, description: 'Returns word details' })
  @ApiResponse({ status: 404, description: 'Word not found' })
  async getWordDetails(
    @Param('word') word: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.entriesService.getWordDetails(word, userId);
  }

  @Post(':word/favorite')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Add word to favorites' })
  @ApiResponse({ status: 204, description: 'Word added to favorites' })
  async addFavorite(
    @Param('word') word: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.entriesService.addFavorite(word, userId);
  }

  @Delete(':word/unfavorite')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove word from favorites' })
  @ApiResponse({ status: 204, description: 'Word removed from favorites' })
  async removeFavorite(
    @Param('word') word: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.entriesService.removeFavorite(word, userId);
  }
}
