export interface TaskResponse {
  task_id: string;
  status: 'queued' | 'processing' | 'success' | 'failed';
  markdown?: string;
  error?: string;
}

export interface ConvertRequest {
  file: File;
}

export type Locale = 'en' | 'zh' | 'ja' | 'fr' | 'de';
