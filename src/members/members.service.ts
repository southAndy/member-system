import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './entities/member.entity';
import { UpdateMemberDto } from './dto/update-member.dto';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
  ) {}

  async findOne(id: string) {
    const member = await this.memberRepository.findOne({ where: { id } });
    if (!member) {
      throw new NotFoundException('會員不存在');
    }

    const { password, ...result } = member;
    return result;
  }

  async update(id: string, updateMemberDto: UpdateMemberDto) {
    const member = await this.memberRepository.findOne({ where: { id } });
    if (!member) {
      throw new NotFoundException('會員不存在');
    }

    // Object.assign() 將 DTO 的值覆蓋到 entity 上，只會更新有傳的欄位
    Object.assign(member, updateMemberDto);
    await this.memberRepository.save(member);

    const { password, ...result } = member;
    return result;
  }

  async remove(id: string) {
    const member = await this.memberRepository.findOne({ where: { id } });
    if (!member) {
      throw new NotFoundException('會員不存在');
    }

    await this.memberRepository.remove(member);
  }
}
