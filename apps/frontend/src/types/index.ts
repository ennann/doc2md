export interface TaskResponse {
  task_id: string;
  status: 'queued' | 'processing' | 'success' | 'failed';
  markdown?: string;
  error?: string;
}

export interface ConvertRequest {
  file: File;
}

export type Locale = 'en' | 'zh-cn' | 'zh-hk' | 'zh-tw' | 'ja' | 'fr' | 'de' | 'es' | 'pt-br' | 'ko' | 'it';
