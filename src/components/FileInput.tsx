'use client';
import Image from 'next/image';
import React, { cloneElement, ReactElement, useRef } from 'react';
import { CirclePlus, CircleX, Music, Video, File, Image as ImageIcon } from 'lucide-react';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { FileType, FileWithPreview, useFileHandler } from './useFileHandler';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const firstNChars = (str: string | undefined, n: number, ellipsis = true) => {
  if (!str) {
    return '';
  }

  if (str.length <= n) {
    return str;
  }

  return `${str.substring(0, n)}${ellipsis ? '...' : ''}`;
};

export const bytesToMB = (bytes: number): number => {
  const mb = bytes / (1024 * 1024);

  return parseFloat(mb.toFixed(1));
};

export interface FileWithUrl extends File {
  name: string;
  getUrl: string;
  size: number;
  error?: boolean | undefined;
}

export enum PreviewImageMode {
  Default = 'default',
  ImageCover = 'image-cover',
}

export enum ErrorCode {
  MaxFiles = 'too-many-files',
  MaxSize = 'file-too-large',
}

const ICONS = {
  [FileType.Audio]: <Music className="mr-2" size={20} />,
  [FileType.Text]: <File className="mr-2" size={20} />,
  [FileType.Image]: <ImageIcon className="mr-2" size={20} />,
  [FileType.Video]: <Video className="mr-2" size={20} />,
};

const ErrorMessage = ({ errorMesssage, id }: { errorMesssage: string; id?: string }) => (
  <div id={id} className="mt-2 flex">
    <p className="text-xs text-red-700">{errorMesssage}</p>
  </div>
);

export interface Props extends React.HTMLAttributes<HTMLElement> {
  onFilesChanged: (files: FileWithPreview[]) => void;
  onFilesRejected?: (files: FileWithPreview[]) => void;
  acceptedType?: FileType;
  currentFiles?: FileWithPreview[];
  maxFiles?: number;
  maxSize?: number;
  previewMode?: PreviewImageMode;
  generatePreviews?: boolean;
  onRemoveUploadedFiles?: (file: FileWithUrl) => void;
  preventOpenFileDialog?: boolean;
  errorMesssage?: string;
  'aria-label'?: string;
}

const FileInput = ({
  children,
  className,
  onFilesChanged,
  onFilesRejected,
  acceptedType = FileType.Image,
  currentFiles,
  maxFiles = 1,
  maxSize = 5 * 1024 * 1024, // 5MB default
  previewMode = PreviewImageMode.Default,
  preventOpenFileDialog = false,
  errorMesssage,
  'aria-label': ariaLabel,
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { files, handleFiles, removeFile } = useFileHandler({
    currentFiles,
    maxFiles,
    maxSize,
    acceptedType,
    onFilesChanged,
    onFilesRejected,
  });

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleFiles(event.dataTransfer.files);
  };

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleFiles(event.target.files);
    }
  };

  const openFileDialog = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (preventOpenFileDialog) {
      event.stopPropagation();
    } else {
      openFileDialog();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (preventOpenFileDialog) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openFileDialog();
    }
  };

  const getRootProps = (props?: React.HTMLAttributes<HTMLDivElement>) => ({
    ...props,
    onClick: handleClick,
    onDrop: onDrop,
    onDragOver: onDragOver,
    role: 'button',
    tabIndex: 0,
    onKeyDown: handleKeyDown,
    'aria-label': ariaLabel || 'File upload',
    'aria-disabled': preventOpenFileDialog,
    className: 'w-max',
  });

  const getInputProps = (props?: React.InputHTMLAttributes<HTMLInputElement>) => ({
    type: 'file',
    ref: inputRef,
    onChange: onInputChange,
    accept: acceptedType,
    multiple: maxFiles > 1,
    className: 'hidden',
    'aria-hidden': true,
    ...props,
  });

  const isCoverImage =
    previewMode === PreviewImageMode.ImageCover && acceptedType === FileType.Image && files[0]?.preview;

  if (children && !files.length) {
    return (
      <div {...getRootProps()} className={cn(getRootProps().className, className)}>
        <input {...getInputProps()} />
        {children}
      </div>
    );
  }

  if (isCoverImage) {
    return (
      <div {...getRootProps()} className={cn(getRootProps().className, className)}>
        <input {...getInputProps()} />
        {cloneElement(
          children as unknown as ReactElement,
          {
            className: cn(
              (children as unknown as ReactElement).props?.className,
              'relative overflow-hidden border-none'
            ),
          },
          <Image src={files[0]?.preview || ''} className="absolute inset-0 box-border" alt="Preview" fill />
        )}
        {errorMesssage && <ErrorMessage errorMesssage={errorMesssage} id="file-input-error" />}
      </div>
    );
  }

  const renderFiles = (
    <section className="flex w-full flex-col space-y-2">
      {files.map((file, index) => (
        <div key={`${file?.name}-${index}`} className="flex items-center justify-between text-left">
          <div className="flex items-center">
            {ICONS[acceptedType]}
            <p className="overflow-hidden text-clip"> {firstNChars(file?.name, 40)}</p>
          </div>
          <div className="flex w-fit items-center">
            <span>{bytesToMB(file?.size)} MB</span>
            <button
              type="button"
              className="ml-2 cursor-pointer"
              onClick={(event) => {
                event.stopPropagation();
                removeFile(index);
              }}
              aria-label="Remove file"
            >
              <CircleX size={20} />
            </button>
          </div>
        </div>
      ))}
    </section>
  );

  return (
    <div className="flex w-full flex-col space-y-2">
      <div
        {...getRootProps({
          onClick: handleClick,
          'aria-describedby': errorMesssage ? 'file-input-error' : undefined,
        })}
        className={cn(
          `flex min-h-8 w-full cursor-pointer items-center justify-center rounded-lg border border-dashed px-4 py-1 text-center text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`,
          files && `text-text-body-200-color hover:border-accent-100 border-solid hover:text-white`,
          preventOpenFileDialog && 'cursor-default',
          className
        )}
      >
        {!files.length && (
          <>
            <input {...getInputProps()} />
            <CirclePlus className="mr-2" size={20} />
            <p className="text-sm">Add file</p>
          </>
        )}
        {files.length > 0 && <>{renderFiles}</>}
      </div>

      {errorMesssage && <ErrorMessage errorMesssage={errorMesssage} id="file-input-error" />}
    </div>
  );
};

export { FileInput };
