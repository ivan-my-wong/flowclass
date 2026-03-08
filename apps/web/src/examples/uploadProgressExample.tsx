import { useState } from 'react'

import useFileUpload from '@/hooks/useFileUpload'
import useStudentSubmission from '@/hooks/useStudentSubmission'

// Contoh penggunaan upload progress untuk student submission
export const StudentSubmissionUploadExample = () => {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const { useUploadStudentSubmission } = useStudentSubmission()

  const uploadMutation = useUploadStudentSubmission(progressEvent => {
    if (progressEvent.lengthComputable) {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      setUploadProgress(percentCompleted)
    }
  })

  const handleFileUpload = async (
    files: File[],
    institutionId: number,
    classLessonId: number,
    studentId: number
  ) => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      await uploadMutation.mutateAsync({
        institutionId,
        payload: {
          studentLessonId: classLessonId,
          studentId,
          files,
        },
      })
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div>
      {isUploading && (
        <div>
          <div>Upload Progress: {uploadProgress}%</div>
          <div style={{ width: '100%', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
            <div
              style={{
                width: `${uploadProgress}%`,
                height: '20px',
                backgroundColor: '#4CAF50',
                borderRadius: '4px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// Contoh penggunaan upload progress untuk image upload
export const ImageUploadExample = () => {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const { useImageUpload } = useFileUpload()

  const uploadMutation = useImageUpload(
    data => {
      console.log('Upload successful:', data)
      setIsUploading(false)
    },
    progressEvent => {
      if (progressEvent.lengthComputable) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        setUploadProgress(percentCompleted)
      }
    }
  )

  const handleImageUpload = async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      await uploadMutation.mutateAsync(file)
    } catch (error) {
      console.error('Upload failed:', error)
      setIsUploading(false)
    }
  }

  return (
    <div>
      {isUploading && (
        <div>
          <div>Image Upload Progress: {uploadProgress}%</div>
          <div style={{ width: '100%', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
            <div
              style={{
                width: `${uploadProgress}%`,
                height: '20px',
                backgroundColor: '#2196F3',
                borderRadius: '4px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
