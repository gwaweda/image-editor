import { useCallback, useRef, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import clsx from 'clsx';

type Props = {
  onSelect: (file: File) => void;
};

export default function ImageUploader({ onSelect }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드할 수 있습니다.');
        return;
      }
      onSelect(file);
    },
    [onSelect]
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={clsx(
        'flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 transition-colors cursor-pointer select-none',
        dragging
          ? 'border-indigo-500 bg-indigo-50'
          : 'border-gray-300 bg-white hover:border-indigo-400 hover:bg-gray-50'
      )}
    >
      <div className="rounded-full bg-indigo-100 p-4">
        <ImagePlus className="h-8 w-8 text-indigo-600" />
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-gray-800">
          이미지를 끌어다 놓거나 클릭해서 선택
        </p>
        <p className="mt-1 text-sm text-gray-500">
          JPG · PNG · WebP 지원 — 이미지는 서버로 전송되지 않고 브라우저에서만 처리됩니다
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}