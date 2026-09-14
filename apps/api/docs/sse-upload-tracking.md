# SSE Upload Tracking Documentation

## Overview

Setiap batch upload ke Google Drive sekarang otomatis dilacak dan mengirim progress real-time ke frontend melalui Server-Sent Events (SSE).

## Features

- ✅ **Automatic Tracking**: Setiap upload batch otomatis mendapat tracking ID
- ✅ **Real-time Progress**: Progress update dikirim via SSE
- ✅ **Two-Step Resumable Upload**: File > 5MB menggunakan two-step resumable upload
- ✅ **Progress Tracking**: Real-time progress tracking untuk setiap file
- ✅ **Error Handling**: Error tracking dan reporting
- ✅ **File Size Info**: Ukuran file tersedia di response

## API Endpoints

### 1. Upload Files (Batch)
```http
POST /integrations/google/drive/upload-batch
```

**Response:**
```json
{
  "uploadId": "upload_1234567890_abc123def",
  "results": [...],
  "totalFiles": 5,
  "message": "Upload started. Track progress at /stream/upload_1234567890_abc123def"
}
```

### 2. SSE Stream Endpoint
```http
GET /stream/{uploadId}
```

**Event Format:**
```json
{
  "data": {
    "uploadId": "upload_1234567890_abc123def",
    "userId": 123,
    "totalFiles": 5,
    "completedFiles": 2,
    "percentage": 40,
    "status": "uploading",
    "currentFile": "document.pdf",
    "message": null,
    "startedAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:31:00Z"
  }
}
```

## Frontend Implementation

### JavaScript Example

```javascript
// 1. Start upload
const uploadResponse = await fetch('/integrations/google/drive/upload-batch', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: formData
});

const { uploadId } = await uploadResponse.json();

// 2. Connect to SSE stream
const eventSource = new EventSource(`/stream/${uploadId}`);

eventSource.onmessage = function(event) {
  const progress = JSON.parse(event.data);
  
  console.log(`Progress: ${progress.percentage}%`);
  console.log(`Current file: ${progress.currentFile}`);
  console.log(`Status: ${progress.status}`);
  
  // Update UI
  updateProgressBar(progress.percentage);
  updateCurrentFile(progress.currentFile);
  
  if (progress.status === 'completed') {
    console.log('Upload completed!', progress.results);
    eventSource.close();
  } else if (progress.status === 'failed') {
    console.error('Upload failed:', progress.message);
    eventSource.close();
  }
};

eventSource.onerror = function(event) {
  console.error('SSE connection error:', event);
  eventSource.close();
};
```

### React Example

```jsx
import { useState, useEffect } from 'react';

function UploadProgress({ uploadId }) {
  const [progress, setProgress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!uploadId) return;

    const eventSource = new EventSource(`/stream/${uploadId}`);
    
    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setProgress(data);
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [uploadId]);

  if (!progress) return <div>Connecting...</div>;

  return (
    <div>
      <div>Status: {progress.status}</div>
      <div>Progress: {progress.percentage}%</div>
      <div>Current file: {progress.currentFile}</div>
      <div>Completed: {progress.completedFiles}/{progress.totalFiles}</div>
      
      {progress.status === 'completed' && (
        <div>✅ Upload completed successfully!</div>
      )}
      
      {progress.status === 'failed' && (
        <div>❌ Upload failed: {progress.message}</div>
      )}
    </div>
  );
}
```

## Event Types

### Progress Update
```json
{
  "uploadId": "upload_123",
  "status": "uploading",
  "percentage": 60,
  "currentFile": "large-video.mp4",
  "completedFiles": 3,
  "totalFiles": 5
}
```

### Completion
```json
{
  "uploadId": "upload_123",
  "status": "completed",
  "percentage": 100,
  "completedFiles": 5,
  "totalFiles": 5,
  "results": [
    {
      "id": "file_id_1",
      "name": "document.pdf",
      "size": "1024000",
      "success": true,
      "uploadId": "upload_123"
    }
  ]
}
```

### Error
```json
{
  "uploadId": "upload_123",
  "status": "failed",
  "message": "Network error during upload",
  "results": [
    {
      "name": "document.pdf",
      "success": false,
      "error": "Network timeout"
    }
  ]
}
```

## Resumable Upload with Progress Tracking

Implementasi menggunakan Google Drive API's built-in resumable upload dengan progress tracking:

### Resumable Upload Process
```typescript
// Upload file with resumable progress tracking
const response = await drive.files.create({
  uploadType: 'resumable',
  requestBody: {
    name: fileName,
    parents: [parentFolderId],
  },
  media: {
    mimeType: 'application/octet-stream',
    body: fileStream, // Readable stream for progress tracking
  },
  fields: 'id, name, webViewLink, parents, mimeType, size',
})
```

### Progress Tracking
```typescript
// Track progress as data is read from stream
stream.on('data', (chunk) => {
  uploadedBytes += chunk.length
  const progress = Math.round((uploadedBytes / totalBytes) * 100)
  // Send progress update via SSE
  updateProgress(progress)
})
```

### Benefits of Resumable Upload
- **Real-time Progress**: Progress tracking untuk setiap file
- **Resumable**: Dapat melanjutkan upload jika terputus
- **Reliable**: Lebih handal untuk file besar (>5MB)
- **Memory Efficient**: Mengurangi penggunaan memory
- **SSE Integration**: Progress dikirim real-time ke frontend

## Configuration Options

### Upload Options
```typescript
interface UploadOptions {
  maxConcurrent?: number;           // Default: 3
  useResumableUpload?: boolean;     // Auto-detect for files > 5MB
  enableSSETracking?: boolean;      // Default: true
  onConflict?: 'overwrite' | 'rename' | 'error';
}
```

### SSE Configuration
- **Connection Timeout**: 30 seconds
- **Retry Interval**: 3 seconds
- **Max Retries**: 5
- **Cleanup Time**: 5 minutes after completion

## Best Practices

1. **Always handle SSE errors** - Implement proper error handling and reconnection logic
2. **Close connections** - Always close EventSource when component unmounts or upload completes
3. **Show progress** - Display meaningful progress information to users
4. **Handle failures** - Provide clear error messages and retry options
5. **Monitor performance** - Track upload performance and adjust concurrent uploads as needed

## Troubleshooting

### Common Issues

1. **SSE Connection Fails**
   - Check if uploadId is valid
   - Verify server is running
   - Check network connectivity

2. **Progress Not Updating**
   - Ensure SSE connection is established
   - Check browser console for errors
   - Verify upload is still in progress

3. **Upload Stuck**
   - Check server logs for errors
   - Verify Google Drive integration is active
   - Check file size limits

### Debug Mode

Enable debug logging by setting environment variable:
```bash
LOG_LEVEL=debug
```

This will show detailed SSE and upload progress logs.
