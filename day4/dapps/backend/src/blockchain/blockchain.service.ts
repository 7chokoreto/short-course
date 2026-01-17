import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { createPublicClient, http } from 'viem';
import { avalancheFuji } from 'viem/chains';
import { SIMPLE_STORAGE_ABI } from './simple-storage.abi';

@Injectable()
export class BlockchainService {
  private client;
  private contractAddress: `0x${string}`;

  constructor() {
    this.client = createPublicClient({
      chain: avalancheFuji,
      transport: http('https://api.avax-test.network/ext/bc/C/rpc', {
        timeout: 10_000, // ⭐ 10 detik timeout untuk handle RPC failure
      }),
    });

    // GANTI dengan address contract kamu dari Day 2
    this.contractAddress = '0x1b1928Db1CB9F9Ffede4B88B53c8FEC86B44B900';
  }

  // 🔹 Read latest value dengan error handling
  async getLatestValue() {
    try {
      const value = await this.client.readContract({
        address: this.contractAddress,
        abi: SIMPLE_STORAGE_ABI,
        functionName: 'getValue',
      });

      return {
        value: value.toString(),
      };
    } catch (error: any) {
      this.handleRpcError(error); // ⭐ Panggil error handler
    }
  }

  // 🔹 Read events dengan error handling
  async getValueUpdatedEvents() {
    try {
      const events = await this.client.getLogs({
        address: this.contractAddress,
        event: {
          type: 'event',
          name: 'ValueUpdated',
          inputs: [{ name: 'newValue', type: 'uint256', indexed: false }],
        },
        fromBlock: 0n,
        toBlock: 'latest',
      });

      return events.map((event) => ({
        blockNumber: event.blockNumber?.toString(),
        value: event.args.newValue.toString(),
        txHash: event.transactionHash,
      }));
    } catch (error: any) {
      this.handleRpcError(error); // ⭐ Panggil error handler
    }
  }

  // ⭐⭐⭐ INI DIA ERROR HANDLER untuk RPC Failure ⭐⭐⭐
  private handleRpcError(error: any): never {
    const message = error?.message?.toLowerCase() || '';

    // Handle timeout
    if (message.includes('timeout')) {
      throw new ServiceUnavailableException(
        'RPC timeout. Silakan coba beberapa saat lagi.',
      );
    }

    // Handle network error
    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('failed')
    ) {
      throw new ServiceUnavailableException(
        'Tidak dapat terhubung ke blockchain RPC.',
      );
    }

    // Handle error lainnya
    throw new InternalServerErrorException(
      'Terjadi kesalahan saat membaca data blockchain.',
    );
  }
}