import { Controller, Post, Get, Delete, Param, Body } from '@nestjs/common';
import { FilesService } from './files.service';
import { CreatePresignDto, TriggerDto } from './files.types';
import { StepFunctionsService } from 'src/aws/step-functions.service';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly stepFunctions: StepFunctionsService,
  ) { }

  @Post('presign')
  async presign(@Body() dto: CreatePresignDto) {
    return this.filesService.createPresign(dto.email);
  }

  @Post('trigger')
  async trigger(@Body() dto: TriggerDto) {
    await this.stepFunctions.startWorkflow(dto.fileId, dto.key);
  }

  @Get(':id/status')
  async status(@Param('id') id: string) {
    return this.filesService.getStatus(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.filesService.removeFile(id);
    return { success: true };
  }

  @Post(':id/success')
  async markSuccess(@Param('id') fileId: string) {
    await this.filesService.markSuccess(fileId);
    return { success: true };
  }

  @Post(':id/error')
  async markError(@Param('id') fileId: string, @Body('error') error: string) {
    await this.filesService.markError(fileId, error);
    return { success: true };
  }
}