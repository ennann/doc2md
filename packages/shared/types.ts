export type TaskStatus = 'queued' | 'processing' | 'success' | 'failed';

export interface TaskResponse {
  task_id: string;
  status: TaskStatus;
  markdown?: string;
  error?: string;
}

export interface ConvertRequest {
  file: File;
}

export type Locale = 'en' | 'zh' | 'ja' | 'fr' | 'de';

export interface HealthResponse {
  status: string;
  redis: string;
}
