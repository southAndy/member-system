import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { UpdateMemberDto } from './dto/update-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard) // all routes in this controller 都需要 JwtAuthGuard 驗證
@Controller('member')
export class MembersController {
  constructor(private membersService: MembersService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.membersService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMemberDto: UpdateMemberDto,
  ) {
    return this.membersService.update(id, updateMemberDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.membersService.remove(id);
    return { message: '會員已刪除' };
  }
}
