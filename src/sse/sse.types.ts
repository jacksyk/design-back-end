export interface ChatCompletionChunk {
  choices: Choice[];
  object: string;

  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  usage: any | null;
  created: number;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  system_fingerprint: any | null;
  model: string;
  id: string;
}

interface Choice {
  delta: Delta;
  finish_reason: string | null;
  index: number;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  logprobs: any | null;
}

interface Delta {
  content: string;
  role?: 'user' | 'system';
}

export interface SSE {
  // 根据实际需求定义属性
  message: Array<{
    content: string;
    /**
     * system：系统默认设置消息
     * user: 用户消息
     * assistant：助手消息
     */
    role: 'system' | 'user' | 'assistant';
  }>;
}
