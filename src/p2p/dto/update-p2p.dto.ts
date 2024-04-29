import { PartialType } from '@nestjs/mapped-types';
import { CreateP2pDto } from './create-p2p.dto';

export class UpdateP2pDto extends PartialType(CreateP2pDto) {}
