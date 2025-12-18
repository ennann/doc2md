export const SUPPORTED_FORMATS = [
  '.docx',
  '.pdf',
  '.pptx',
  '.doc',
  '.xlsx',
  '.html',
] as const;

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export const TASK_TTL = 300; // 5 minutes

export const POLL_INTERVAL = 2000; // 2 seconds

export const MAX_POLL_ATTEMPTS = 60; // 2 minutes total
