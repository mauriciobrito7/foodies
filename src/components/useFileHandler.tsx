'use client';
import { useState, useCallback, useEffect } from 'react';

export enum FileType {
  Audio = 'audio/*',
  Image = 'image/*',
  Text = 'text/*',
  Video = 'video/*',
}

export type ByteUnit = 'MB' | 'GB';

/**
 * Converts bytes to the specified unit (MB or GB).
 * @param bytes - The size in bytes.
 * @param unit - The unit to convert to ('MB' or 'GB').
 * @returns The size in the specified unit.
 */
export const bytesToUnit = (bytes: number, unit: ByteUnit): number => {
  switch (unit) {
    case 'MB':
      const mb = bytes / (1024 * 1024);
      return parseFloat(mb.toFixed(1));
    case 'GB':
      const gb = bytes / (1024 * 1024 * 1024);
      return parseFloat(gb.toFixed(1));
  }
};

/**
 * Maps a MIME type string to a `FileType` enum.
 * @param type - The MIME type of the file.
 * @returns The corresponding `FileType` enum.
 */
const mapType = (type: string): FileType => {
  const typeMap: Record<string, FileType> = {
    application: FileType.Text,
    text: FileType.Text,
    image: FileType.Image,
    audio: FileType.Audio,
    video: FileType.Video,
  };

  for (const key in typeMap) {
    if (type?.includes(key)) {
      return typeMap[key];
    }
  }
  return FileType.Image;
};

/**
 * Determines the appropriate unit (MB or GB) based on the file size.
 * @param bytes - The size in bytes.
 * @returns The most suitable unit ('MB' or 'GB').
 */
export const getAppropriateUnit = (bytes: number): ByteUnit => {
  return bytes >= 1024 * 1024 * 1024 ? 'GB' : 'MB';
};

export interface FileWithPreview extends File {
  preview?: string;
  error?: string;
}

interface UseFileHandlerProps {
  maxFiles: number;
  maxSize: number;
  acceptedType: string;
  onFilesChanged: (files: FileWithPreview[]) => void;
  onFilesRejected?: (files: FileWithPreview[]) => void;
  currentFiles?: FileWithPreview[];
}

/**
 * Custom hook to handle file selection, validation, and management.
 * @param maxFiles - Maximum number of files allowed.
 * @param maxSize - Maximum file size in bytes.
 * @param acceptedType - Accepted MIME type for files.
 * @param onFilesChanged - Callback when files are accepted.
 * @param onFilesRejected - Callback when files are rejected.
 * @param currentFiles - Initial files to load.
 * @returns An object with the current files, errors, and handler functions.
 */
export const useFileHandler = ({
  maxFiles,
  maxSize,
  acceptedType,
  onFilesChanged,
  onFilesRejected,
  currentFiles,
}: UseFileHandlerProps) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  /**
   * Validates a single file for size and type.
   * @param file - The file to validate.
   * @returns An error message if invalid, or null if valid.
   */
  const validateFile = useCallback(
    (file: File): string | null => {
      if (file.size > maxSize) {
        const unit = getAppropriateUnit(maxSize);
        const maxSizeFormatted = bytesToUnit(maxSize, unit);
        return `The file "${file.name}" exceeds the maximum size of ${maxSizeFormatted} ${unit}.`;
      }

      const mappedType = mapType(file.type);

      if (mappedType !== acceptedType) {
        return `The file type "${file.type}" is not accepted.`;
      }
      return null;
    },
    [maxSize, acceptedType]
  );

  /**
   * Validates and processes selected files, separating them into accepted and rejected files.
   * @param selectedFiles - The list of files selected by the user.
   * @returns An object containing arrays of accepted and rejected files, and error messages.
   */
  const validateSelectedFiles = useCallback(
    (
      selectedFiles: FileList
    ): {
      acceptedFiles: FileWithPreview[];
      rejectedFiles: FileWithPreview[];
      errorMessages: string[];
    } => {
      const acceptedFiles: FileWithPreview[] = [];
      const rejectedFiles: FileWithPreview[] = [];
      const errorMessages: string[] = [];

      Array.from(selectedFiles).forEach((file) => {
        const error = validateFile(file);
        const fileWithPreview: FileWithPreview = { ...file };

        if (error) {
          fileWithPreview.error = error;
          rejectedFiles.push(fileWithPreview);
          errorMessages.push(error);
        } else {
          if (file.type.startsWith('image/')) {
            fileWithPreview.preview = URL.createObjectURL(file);
          }
          acceptedFiles.push(fileWithPreview);
        }
      });

      return { acceptedFiles, rejectedFiles, errorMessages };
    },
    [validateFile]
  );

  /**
   * Revokes object URLs created for image previews to free up memory.
   * @param fileList - The list of files to revoke previews for.
   */
  const revokePreviews = (fileList: FileWithPreview[]) => {
    fileList.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
  };

  /**
   * Determines the new list of files to set, considering the maximum allowed files.
   * @param acceptedFiles - The list of newly accepted files.
   * @returns The new list of files, or null if the maxFiles limit is exceeded.
   */
  const getNewFiles = useCallback(
    (acceptedFiles: FileWithPreview[]): FileWithPreview[] | null => {
      let newFiles: FileWithPreview[] = [];

      if (maxFiles === 1) {
        revokePreviews(files);
        newFiles = acceptedFiles.slice(0, maxFiles);
      } else {
        const totalFiles = files.length + acceptedFiles.length;
        if (totalFiles > maxFiles) {
          const numToAdd = maxFiles - files.length;
          if (numToAdd > 0) {
            newFiles = [...files, ...acceptedFiles.slice(0, numToAdd)];
          } else {
            return null;
          }
        } else {
          newFiles = [...files, ...acceptedFiles];
        }
      }

      return newFiles;
    },
    [files, maxFiles]
  );

  /**
   * Handles the addition of new files, updating the state and invoking callbacks.
   * @param selectedFiles - The list of files selected by the user.
   */
  const handleFiles = useCallback(
    (selectedFiles: FileList) => {
      const { acceptedFiles, rejectedFiles, errorMessages } = validateSelectedFiles(selectedFiles);

      setErrors(errorMessages);

      if (acceptedFiles.length > 0) {
        const newFiles = getNewFiles(acceptedFiles);

        if (newFiles) {
          setFiles(newFiles);
          onFilesChanged(newFiles);
        } else {
          const maxFilesError = `You can upload a maximum of ${maxFiles} file(s).`;
          setErrors((prevErrors) => [...prevErrors, maxFilesError]);

          if (onFilesRejected) {
            acceptedFiles.forEach((file) => {
              file.error = 'Exceeded the maximum number of allowed files.';
            });
            onFilesRejected(acceptedFiles);
          }
          return;
        }
      }

      if (rejectedFiles.length > 0 && onFilesRejected) {
        onFilesRejected(rejectedFiles);
      }
    },
    [validateSelectedFiles, getNewFiles, maxFiles, onFilesChanged, onFilesRejected]
  );

  /**
   * Removes a file from the list by index and updates the state.
   * @param index - The index of the file to remove.
   */
  const removeFile = useCallback(
    (index: number) => {
      const fileToRemove = files[index];
      if (fileToRemove && fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      const newFiles = files.filter((_, i) => i !== index);
      setFiles(newFiles);
      onFilesChanged(newFiles);
    },
    [files, onFilesChanged]
  );

  useEffect(() => {
    if (!currentFiles) return;

    const initializeFiles = async () => {
      const initializedFiles = await Promise.all(
        currentFiles.map(async (file) => {
          if (file.preview) {
            return file;
          } else if (file.type && file.type.startsWith('image/')) {
            return {
              ...file,
              preview: file.preview || '',
            };
          } else {
            return file;
          }
        })
      );

      setFiles(initializedFiles);
      onFilesChanged(initializedFiles);
    };

    initializeFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFiles]);

  useEffect(() => {
    return () => {
      revokePreviews(files);
    };
  }, [files]);

  return {
    files,
    errors,
    handleFiles,
    removeFile,
  };
};
