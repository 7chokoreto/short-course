import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('info') // ⭐ Tag baru untuk info
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get info mahasiswa' })
  @ApiResponse({ 
    status: 200,
    schema: {
      example: {
        message: 'Avalanche dApp Backend API',
        nama: 'NAMA KAMU',
        nim: '12345678',
        course: 'Avalanche Indonesia Short Course - Day 4'
      }
    }
  })
  getHello() {
    return {
      message: 'Avalanche dApp Backend API',
      nama: 'NAMA KAMU', // ⭐ GANTI
      nim: '12345678',   // ⭐ GANTI
      course: 'Avalanche Indonesia Short Course - Day 4',
      swagger: 'http://localhost:3000/api'
    };
  }
}