import { Module } from '@nestjs/common';
import { P2pService } from './p2p.service';
import { P2pController } from './p2p.controller';

@Module({
  controllers: [P2pController],
  providers: [P2pService],
})
export class P2pModule {}
