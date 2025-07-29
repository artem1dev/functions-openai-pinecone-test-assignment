import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity, FileStatus } from './files.entity';
import { S3Service } from '../aws/s3.service';
import { StepFunctionsService } from '../aws/step-functions.service';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(FileEntity)
    private readonly repo: Repository<FileEntity>,
    private readonly s3Service: S3Service,
    private readonly stepFunctions: StepFunctionsService,
  ) { }

  async createPresign(email: string): Promise<{ fileId: string; uploadUrl: string; key: string }> {
    const file = this.repo.create({
      userEmail: email,
      s3Key: '',
      status: 'pending',
    });
    await this.repo.save(file);

    const key = `uploads/${email}/${file.id}.pdf`;
    const uploadUrl = await this.s3Service.getPresignedUrl(key);

    file.s3Key = key;
    await this.repo.save(file);

    return { fileId: file.id, uploadUrl, key };
  }

  async getStatus(fileId: string): Promise<{ status: FileStatus; updatedAt: Date }> {
    const file = await this.repo.findOneBy({ id: fileId });
    if (!file) throw new NotFoundException(`File ${fileId} not found`);
    return { status: file.status, updatedAt: file.updatedAt };
  }

  async removeFile(fileId: string): Promise<void> {
    const file = await this.repo.findOneBy({ id: fileId });
    if (!file) throw new NotFoundException(`File ${fileId} not found`);
    await this.s3Service.delete(file.s3Key);
    await this.repo.remove(file);
  }

  async markSuccess(fileId: string): Promise<void> {
    await this.repo.update(fileId, { status: 'success' });
  }

  async markError(fileId: string, errorMessage: string): Promise<void> {
    await this.repo.update(fileId, { status: 'error', errorMessage });
  }

}