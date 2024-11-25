'use client';
import { FileWithPreview } from '@/components/useFileHandler';
import { FileInput, PreviewImageMode } from '@/components/FileInput';
import { Plus } from 'lucide-react';

export default function SharePage() {
  return (
    <main className="px-6 text-white">
      <h1>Share</h1>
      <FileInput
        onFilesChanged={(files: FileWithPreview[]) => {
          console.log(files);
        }}
        onFilesRejected={(files: FileWithPreview[]) => {
          console.log(files);
        }}
        previewMode={PreviewImageMode.ImageCover}
        maxFiles={1}
        maxSize={5 * 1024 * 1024}
      >
        <div className="mx-auto flex !h-16 w-16 cursor-pointer items-center justify-center rounded-full border border-neutral-700 bg-[#060708] text-white transition-colors delay-100 hover:bg-[#1F2025]">
          <Plus />
        </div>
      </FileInput>
    </main>
  );
}
