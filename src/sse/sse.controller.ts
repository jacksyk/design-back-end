import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import OpenAI from 'openai';
import { ChatCompletionChunk, SSE } from './sse.types';
// 定义 SSE 接口

const openai = new OpenAI({
  // 若没有配置环境变量，请用百炼API Key将下行替换为：apiKey: "sk-xxx",
  apiKey: 'sk-ebe435978e054615bf28e57fd4828922',
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});

const handleChunk = (chunk: ChatCompletionChunk, count: number) => {
  const data = {
    content: chunk.choices[0].delta.content,
    role: 'assistant',
  };

  if (count === 0) {
    return {
      data,
      flag: 'start',
    };
  }

  if (chunk.choices[0].finish_reason === 'stop') {
    return {
      data,
      flag: 'end',
    };
  }

  return {
    data,
    flag: 'streaming',
  };
};

@Controller('sse')
export class SseController {
  @Post()
  async sse(@Body() sse: SSE, @Res() res: Response) {
    // 处理 SSE 请求
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

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
      res.write(`data: ${JSON.stringify(handledChunk)}\n\n`);
      count++;
    }
    res.end();
  }
}
