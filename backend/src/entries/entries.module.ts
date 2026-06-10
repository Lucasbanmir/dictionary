import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EntriesController } from './entries.controller';
import { EntriesService } from './entries.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Module({
  imports: [JwtModule],
  controllers: [EntriesController],
  providers: [EntriesService, JwtAuthGuard],
})
export class EntriesModule {}
