import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'; // ⭐ Import
import { BlockchainService } from './blockchain.service';

@ApiTags('blockchain') // ⭐ Tag untuk grouping
@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Get('value')
  @ApiOperation({ 
    summary: 'Get latest value from smart contract',
    description: 'Membaca nilai terbaru yang tersimpan di smart contract SimpleStorage'
  }) // ⭐ Deskripsi endpoint
  @ApiResponse({ 
    status: 200, 
    description: 'Berhasil membaca value dari contract',
    schema: {
      example: {
        value: '42'
      }
    }
  }) // ⭐ Contoh response sukses
  @ApiResponse({ 
    status: 503, 
    description: 'RPC timeout atau network error' 
  }) // ⭐ Contoh response error
  async getValue() {
    return this.blockchainService.getLatestValue();
  }

  @Get('events')
  @ApiOperation({ 
    summary: 'Get ValueUpdated events',
    description: 'Membaca semua event ValueUpdated yang pernah terjadi di smart contract'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Berhasil membaca event history',
    schema: {
      example: [
        {
          blockNumber: '12345',
          value: '42',
          txHash: '0xabc123...'
        }
      ]
    }
  })
  @ApiResponse({ 
    status: 503, 
    description: 'RPC timeout atau network error' 
  })
  async getEvents() {
    return this.blockchainService.getValueUpdatedEvents();
  }
}