import type { TaskResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function uploadFile(file: File): Promise<TaskResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/convert`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload file');
  }

  return response.json();
}

export async function getTaskStatus(taskId: string): Promise<TaskResponse> {
  const response = await fetch(`${API_BASE_URL}/task/${taskId}`);

  if (!response.ok) {
    throw new Error('Failed to get task status');
  }

  return response.json();
}

export function downloadMarkdown(text: string, filename = 'converted.md'): void {
  const blob = new Blob([text], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}
