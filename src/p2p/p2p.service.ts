import { Injectable } from '@nestjs/common';
import { CreateP2pDto } from './dto/create-p2p.dto';
import { UpdateP2pDto } from './dto/update-p2p.dto';

@Injectable()
export class P2pService {
  create(createP2pDto: CreateP2pDto) {
    return 'This action adds a new p2p';
  }

  findAll() {
    return `This action returns all p2p`;
  }

  findOne(id: number) {
    return `This action returns a #${id} p2p`;
  }

  update(id: number, updateP2pDto: UpdateP2pDto) {
    return `This action updates a #${id} p2p`;
  }

  remove(id: number) {
    return `This action removes a #${id} p2p`;
  }
}
