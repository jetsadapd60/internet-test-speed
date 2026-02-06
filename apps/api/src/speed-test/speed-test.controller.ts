import { Controller, Get, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';

@Controller()
export class SpeedTestController {
  @Get('download')
  download(@Query('duration') durationStr: string, @Res() res: Response) {
    const duration = parseInt(durationStr || '10', 10);
    const chunkSize = 1024 * 1024; // 1MB chunks
    const buffer = Buffer.alloc(chunkSize, 'x'); // Dummy data

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename=speedtest.dat');

    const startTime = Date.now();
    const endTime = startTime + duration * 1000;

    const stream = () => {
      if (Date.now() >= endTime) {
        res.end();
        return;
      }

      const canWrite = res.write(buffer);
      if (canWrite) {
        // If buffer is not full, keep writing immediately to saturate link
        // Use setImmediate to allow event loop to handle I/O, preventing blocking
        setImmediate(stream);
      } else {
        // If buffer is full, wait for 'drain' event
        res.once('drain', stream);
      }
    };

    stream();
  }

  @Post('upload')
  upload(@Res() res: Response) {
    // We just accept the data and return success instantly.
    // Express/Nest has already read the body if using body-parser,
    // or if we want to be faster we could ignore body but standard controller is fine for 64KB chunks.
    res.sendStatus(200);
  }
}
