import { Wand2, RotateCcw } from 'lucide-react';

type Props = {
  imageUrl: string;
  fileName: string;
  onRemoveBackground: () => void;
  onCancel: () => void;
};

export default function OriginalPreview({
  imageUrl,
  fileName,
  onRemoveBackground,
  onCancel,
}: Props) {
  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl bg-white p-8 shadow-sm">
      <div className="flex max-h-[480px] items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-2">
        <img
          src={imageUrl}
          alt="업로드한 원본 이미지"
          className="max-h-[440px] max-w-full object-contain"
        />
      </div>
      <p className="text-sm text-gray-500">{fileName}</p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RotateCcw className="h-4 w-4" /> 다른 이미지 선택
        </button>
        <button
          onClick={onRemoveBackground}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700"
        >
          <Wand2 className="h-5 w-5" /> 배경 제거
        </button>
      </div>
      <p className="text-xs text-gray-400">
        버튼을 누르면 배경 제거가 시작됩니다 — 이미지는 서버로 전송되지 않습니다
      </p>
    </div>
  );
}