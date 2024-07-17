import { Injectable, BadRequestException } from '@nestjs/common';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join, extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient, Image, Banner } from '@prisma/client';

@Injectable()
export class UploadService {
  private prisma: PrismaClient;
  private basePath =
    'C:/Users/980185/Desktop/Faculdade/Projeto integrador/back/src/upload';

  constructor() {
    this.prisma = new PrismaClient();
  }

  async uploadImage(
    file: Express.Multer.File,
    entity: 'volunteer' | 'organizer',
  ): Promise<Image> {
    if (!file || !file.buffer) {
      throw new BadRequestException('File is required');
    }

    const fileExt = extname(file.originalname);
    const filename = `${uuidv4()}${fileExt}`;
    const subFolder = entity === 'volunteer' ? 'volunteers' : 'organizers';
    const filePath = join(this.basePath, subFolder);

    // Ensure the directory exists
    if (!existsSync(filePath)) {
      mkdirSync(filePath, { recursive: true });
    }

    try {
      await new Promise((resolve, reject) => {
        const writeStream = createWriteStream(join(filePath, filename));
        writeStream.write(file.buffer);
        writeStream.end();
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });
    } catch (error) {
      throw new Error(`Failed to save file: ${error.message}`);
    }

    const createdImage = await this.prisma.image.create({
      data: {
        url: `/${subFolder}/${filename}`,
      },
    });

    return createdImage;
  }

  async uploadBanner(file: Express.Multer.File): Promise<Banner> {
    if (!file || !file.buffer) {
      throw new BadRequestException('File is required');
    }

    const fileExt = extname(file.originalname);
    const filename = `${uuidv4()}${fileExt}`;
    const filePath = join(this.basePath, 'banners');

    // Ensure the directory exists
    if (!existsSync(filePath)) {
      mkdirSync(filePath, { recursive: true });
    }

    try {
      await new Promise((resolve, reject) => {
        const writeStream = createWriteStream(join(filePath, filename));
        writeStream.write(file.buffer);
        writeStream.end();
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });
    } catch (error) {
      throw new Error(`Failed to save file: ${error.message}`);
    }

    const createdBanner = await this.prisma.banner.create({
      data: {
        url: `/banners/${filename}`,
      },
    });

    return createdBanner;
  }

  async getImageUrl(imageId: string): Promise<string | null> {
    const image = await this.prisma.image.findUnique({
      where: { id: imageId },
    });

    return image ? image.url : null;
  }

  async getBannerUrl(bannerId: string): Promise<string | null> {
    const banner = await this.prisma.banner.findUnique({
      where: { id: bannerId },
    });

    return banner ? banner.url : null;
  }
}
