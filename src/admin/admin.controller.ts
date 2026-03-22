import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateQuestionDto } from '../questions/dto/create-question.dto';
import { AdminService } from './admin.service';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { FilterQuestionsDto } from './dto/filter-questions.dto';
import { CreateAdminTestDto } from './dto/create-admin-test.dto';
import { AddSectionQuestionsDto } from './dto/add-section-questions.dto';
import { RolesGuard } from './guards/roles.guard';
import { AdminGuard } from './guards/admin.guard';

@UseGuards(JwtAuthGuard, RolesGuard, AdminGuard)
@Roles('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('questions')
  createQuestion(@Body() dto: CreateQuestionDto) {
    return this.adminService.createQuestion(dto);
  }

  @Patch('questions/:id')
  updateQuestion(@Param('id') id: string, @Body() dto: UpdateQuestionDto) {
    return this.adminService.updateQuestion(id, dto);
  }

  @Delete('questions/:id')
  deleteQuestion(@Param('id') id: string) {
    return this.adminService.deleteQuestion(id);
  }

  @Get('questions')
  filterQuestions(@Query() filters: FilterQuestionsDto) {
    return this.adminService.filterQuestions(filters);
  }

  @Post('tests')
  createTest(@Body() dto: CreateAdminTestDto) {
    return this.adminService.createTest(dto);
  }

  @Post('tests/:testId/sections/:sectionIndex/questions')
  addQuestionsToSection(
    @Param('testId') testId: string,
    @Param('sectionIndex', ParseIntPipe) sectionIndex: number,
    @Body() dto: AddSectionQuestionsDto,
  ) {
    return this.adminService.addQuestionsToSection(testId, sectionIndex, dto);
  }

  @Delete('tests/:testId/sections/:sectionIndex/questions/:questionId')
  removeQuestionFromSection(
    @Param('testId') testId: string,
    @Param('sectionIndex', ParseIntPipe) sectionIndex: number,
    @Param('questionId') questionId: string,
  ) {
    return this.adminService.removeQuestionFromSection(testId, sectionIndex, questionId);
  }

  @Get('tests/:testId')
  getTest(@Param('testId') testId: string) {
    return this.adminService.getTestById(testId);
  }

  @Patch('tests/:testId/publish')
  publishTest(@Param('testId') testId: string) {
    return this.adminService.publishTest(testId);
  }

  @Patch('tests/:testId/unpublish')
  unpublishTest(@Param('testId') testId: string) {
    return this.adminService.unpublishTest(testId);
  }

  @Delete('tests/:testId')
  deleteTest(@Param('testId') testId: string) {
    return this.adminService.deleteTest(testId);
  }
}
