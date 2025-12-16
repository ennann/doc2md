'use client';

import { useState, useCallback, useRef } from 'react';
import { uploadFile, getTaskStatus, downloadMarkdown } from '@/lib/api';
import type { TaskResponse } from '@/types';
import { Upload, CheckCircle2, AlertCircle, FileText, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  t: any;
}

export default function FileUploader({ t }: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pollTaskStatus = useCallback(async (id: string) => {
    const maxAttempts = 60;
    let attempts = 0;

    const poll = async () => {
      if (attempts >= maxAttempts) {
        setStatus('error');
        setError('Timeout: Conversion took too long');
        return;
      }

      try {
        const response: TaskResponse = await getTaskStatus(id);

        if (response.status === 'success' && response.markdown) {
          setStatus('success');
          downloadMarkdown(response.markdown, file?.name.replace(/\.[^/.]+$/, '.md') || 'converted.md');
        } else if (response.status === 'failed') {
          setStatus('error');
          setError(response.error || 'Conversion failed');
        } else {
          attempts++;
          setTimeout(poll, 2000);
        }
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    poll();
  }, [file]);

  const validateFile = (selectedFile: File): boolean => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];

    if (selectedFile.size > maxSize) {
      setError('File size exceeds 10MB limit');
      setStatus('error');
      return false;
    }

    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Unsupported file type. Please use DOCX, PDF, or PPTX');
      setStatus('error');
      return false;
    }

    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
      setStatus('idle');
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
      setStatus('idle');
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setStatus('uploading');
      setError(null);

      const response: TaskResponse = await uploadFile(file);
      setTaskId(response.task_id);
      setStatus('processing');

      pollTaskStatus(response.task_id);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <div
        className={cn(
          'upload-area relative',
          isDragging && 'dragging',
          (status === 'processing' || status === 'uploading') && 'processing'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClickUpload}
      >
        <div className="upload-icon">
          <Upload className="h-16 w-16" />
        </div>

        <h2 className="text-xl font-semibold mb-2">{t.upload.dragDrop}</h2>
        <p className="text-sm text-muted-foreground mb-4">{t.upload.orClick}</p>

        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept=".docx,.pdf,.pptx"
          disabled={status === 'uploading' || status === 'processing'}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-2">
          <p className="supported-formats">{t.upload.supported}</p>
          <div className="flex items-center gap-1.5 text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-900/10 px-3 py-1 rounded-full text-xs font-medium">
            <ShieldCheck className="h-3.5 w-3.5" />
            {t.privacy.secure}
          </div>
        </div>
      </div>

      {file && status === 'idle' && (
        <div className="file-selected">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-10 w-10 text-primary" />
            <div className="file-info flex-1">
              <div className="file-name">{file.name}</div>
              <div className="file-size">{(file.size / 1024).toFixed(2)} KB</div>
            </div>
          </div>
          <Button onClick={handleUpload} className="w-full" size="lg">
            {t.upload.convert}
          </Button>
        </div>
      )}

      {(status === 'uploading' || status === 'processing') && (
        <div className="status-indicator processing">
          <div className="progress-bar mb-4">
            <div className="progress-bar-fill"></div>
          </div>
          <p className="text-sm text-muted-foreground">{t.upload.processing}</p>
        </div>
      )}

      {status === 'success' && (
        <div className="status-indicator success">
          <div className="status-icon">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <p className="text-sm">{t.upload.success}</p>
        </div>
      )}

      {status === 'error' && error && (
        <div className="status-indicator error">
          <div className="status-icon">
            <AlertCircle className="h-6 w-6" />
          </div>
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
