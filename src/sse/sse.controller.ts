import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import OpenAI from 'openai';
import { ChatCompletionChunk, SSE } from './sse.types';
// 定义 SSE 接口

const openai = new OpenAI({
  // 若没有配置环境变量，请用百炼API Key将下行替换为：apiKey: "sk-xxx",
  apiKey: 'sk-ebe435978e054615bf28e57fd4828922',
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});

@Controller('sse')
export class SseController {
  @Get()
  getSse() {
    return '请用post方法>>>';
  }

  @Post()
  async sse(@Body() sse: SSE, @Res() res: Response) {
    console.log('sse', sse);
    // 处理 SSE 请求
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const bufferContent: string[] = [];

    const handleChunk = (chunk: ChatCompletionChunk) => {
      bufferContent.push(chunk.choices[0].delta.content);

      const data = {
        content: bufferContent.join(''),
        role: 'assistant',
      };

      return {
        data,
      };
    };

    const completion = await openai.chat.completions.create({
      model: 'qwen-plus',
      // messages: [
      //   { role: 'system', content: 'You are a helpful assistant.' },
      //   { role: 'user', content: '你是谁？' },
      // ],
      messages: sse.message,
      stream: true,
    });

    let count = 0;

    for await (const chunk of completion) {
      // @ts-ignore
      const handledChunk = handleChunk(chunk, count);
      res.write(`messageType:line\ndata: ${JSON.stringify(handledChunk)}\n\n`);
      count++;
    }
    res.end();
  }
}
