import {
  Controller,
  Get,
  Delete,
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
import { UserService } from './user.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user/me')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns user profile' })
  async getProfile(@CurrentUser('sub') userId: string) {
    return this.userService.getProfile(userId);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get user word history' })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiResponse({ status: 200, description: 'Returns paginated word history' })
  async getHistory(
    @CurrentUser('sub') userId: string,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    return this.userService.getHistory(userId, {
      limit: limit ? parseInt(limit, 10) : 10,
      page: page ? parseInt(page, 10) : 1,
    });
  }

  @Get('favorites')
  @ApiOperation({ summary: 'Get user favorite words' })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiResponse({ status: 200, description: 'Returns paginated favorites list' })
  async getFavorites(
    @CurrentUser('sub') userId: string,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    return this.userService.getFavorites(userId, {
      limit: limit ? parseInt(limit, 10) : 10,
      page: page ? parseInt(page, 10) : 1,
    });
  }

  @Delete('history')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clear user word history' })
  @ApiResponse({ status: 204, description: 'History cleared successfully' })
  async clearHistory(@CurrentUser('sub') userId: string) {
    return this.userService.clearHistory(userId);
  }
}
