import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Guest } from './entities/guest.entity';
import { GuestsService } from './services/guests.service';

@Module({
  imports: [TypeOrmModule.forFeature([Guest])],
  providers: [GuestsService],
  exports: [GuestsService],
})
export class GuestsModule {}
