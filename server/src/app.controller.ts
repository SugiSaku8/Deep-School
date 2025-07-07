import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class AppController {
  @Get()
  getRoot(): string {
    return 'サーバーは正常に起動しています';
  }

  @Get('status')
  status(@Res() res: Response) {
    res.type('html').send(`
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Deep School Server Status</title>
        <style>
          body {
            background: #f5f5f7;
            color: #1d1d1f;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          .card {
            background: #fff;
            border-radius: 24px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.08), 0 1.5px 4px rgba(0,0,0,0.03);
            padding: 40px 32px;
            max-width: 400px;
            text-align: center;
          }
          .logo {
            width: 64px;
            height: 64px;
            margin-bottom: 16px;
            border-radius: 16px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          }
          h1 {
            font-size: 2rem;
            font-weight: 700;
            margin: 0 0 8px 0;
            letter-spacing: -0.02em;
          }
          p {
            font-size: 1.1rem;
            margin: 0 0 16px 0;
            color: #86868b;
          }
          .status {
            display: inline-block;
            background: #34c759;
            color: #fff;
            font-size: 1rem;
            font-weight: 600;
            border-radius: 12px;
            padding: 4px 16px;
            margin-top: 12px;
            box-shadow: 0 1px 4px rgba(52,199,89,0.08);
          }
        </style>
      </head>
      <body>
        <div class="card">
          <img src="https://raw.githubusercontent.com/SugiSaku8/Deep-School/a682dfc34526b9dd12b09789ec2a56bfa31704e3/Client/public/ico/icon_top.png" alt="Deep School Logo" class="logo" />
          <h1>Deep School Server</h1>
          <p>サーバーは正常に稼働しています。</p>
          <span class="status">Online</span>
        </div>
      </body>
      </html>
    `);
  }
}