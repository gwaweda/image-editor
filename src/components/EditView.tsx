import { useEffect, useState } from 'react';
import {
  Crop,
  Download,
  RotateCcw,
  Lock,
  Unlock,
  Undo2,
  Redo2,
} from 'lucide-react';
import CropEditor from './CropEditor';
import {
  loadImage,
  exportImage,
  downloadBlob,
  type ExportFormat,
} from '../lib/canvasUtils';

type Props = {
  imageUrl: string;
  onImageChange: (url: string) => void;
  onReset: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

const FORMATS: { label: string; value: ExportFormat; ext: string }[] = [
  { label: 'PNG (투명 배경)', value: 'image/png', ext: 'png' },
  { label: 'WebP (투명 배경)', value: 'image/webp', ext: 'webp' },
  { label: 'JPEG (흰색 배경)', value: 'image/jpeg', ext: 'jpg' },
];

export default function EditView({
  imageUrl,
  onImageChange,
  onReset,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: Props) {
  const [natural, setNatural] = useState({ width: 0, height: 0 });
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockRatio, setLockRatio] = useState(true);
  const [format, setFormat] = useState<ExportFormat>('image/png');
  const [cropping, setCropping] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadImage(imageUrl).then((img) => {
      setNatural({ width: img.naturalWidth, height: img.naturalHeight });
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
    });
  }, [imageUrl]);

  const ratio = natural.width > 0 ? natural.height / natural.width : 1;

  const changeWidth = (w: number) => {
    setWidth(w);
    if (lockRatio) setHeight(Math.round(w * ratio));
  };
  const changeHeight = (h: number) => {
    setHeight(h);
    if (lockRatio && ratio > 0) setWidth(Math.round(h / ratio));
  };

  const handleDownload = async () => {
    if (width < 1 || height < 1) {
      alert('가로/세로 크기를 확인해 주세요.');
      return;
    }
    setExporting(true);
    try {
      const blob = await exportImage(imageUrl, width, height, format);
      const ext = FORMATS.find((f) => f.value === format)!.ext;
      downloadBlob(blob, `bg-removed-${width}x${height}.${ext}`);
    } catch (e) {
      alert(e instanceof Error ? e.message : '다운로드에 실패했습니다.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* 미리보기 */}
      <div className="flex-1">
        <div className="checkerboard flex min-h-[320px] items-center justify-center rounded-2xl border border-gray-200 p-4">
          <img
            src={imageUrl}
            alt="배경이 제거된 이미지"
            className="max-h-[480px] max-w-full object-contain"
          />
        </div>
        <p className="mt-2 text-center text-xs text-gray-400">
          체커보드 무늬는 투명 영역 표시용입니다 · 원본 {natural.width}×
          {natural.height}px
        </p>
      </div>

      {/* 편집 패널 */}
      <div className="flex w-full flex-col gap-5 rounded-2xl bg-white p-6 shadow-sm lg:w-80">
        {/* 되돌리기 / 다시 실행 */}
        <div className="flex gap-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="되돌리기 (Ctrl+Z)"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <Undo2 className="h-4 w-4" /> 되돌리기
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="다시 실행 (Ctrl+Y)"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <Redo2 className="h-4 w-4" /> 다시 실행
          </button>
        </div>

        <button
          onClick={() => setCropping(true)}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Crop className="h-4 w-4" /> 자르기
        </button>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              크기 조절 <span className="text-xs text-gray-400">(다운로드 시 적용)</span>
            </span>
            <button
              onClick={() => setLockRatio(!lockRatio)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600"
              title={lockRatio ? '비율 고정 해제' : '비율 고정'}
            >
              {lockRatio ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
              {lockRatio ? '비율 고정됨' : '비율 자유'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex-1">
              <span className="text-xs text-gray-500">가로(px)</span>
              <input
                type="number"
                min={1}
                value={width || ''}
                onChange={(e) => changeWidth(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </label>
            <span className="mt-5 text-gray-400">×</span>
            <label className="flex-1">
              <span className="text-xs text-gray-500">세로(px)</span>
              <input
                type="number"
                min={1}
                value={height || ''}
                onChange={(e) => changeHeight(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
            </label>
          </div>
          <div className="mt-2 flex gap-1.5">
            {[100, 75, 50, 25].map((p) => (
              <button
                key={p}
                onClick={() => {
                  setWidth(Math.round((natural.width * p) / 100));
                  setHeight(Math.round((natural.height * p) / 100));
                }}
                className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200"
              >
                {p}%
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-sm font-medium text-gray-700">저장 형식</span>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as ExportFormat)}
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          >
            {FORMATS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleDownload}
          disabled={exporting}
          className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          {exporting ? '저장 중…' : `다운로드 (${width}×${height})`}
        </button>

        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <RotateCcw className="h-4 w-4" /> 새 이미지로 시작
        </button>
      </div>

      {cropping && (
        <CropEditor
          imageUrl={imageUrl}
          naturalWidth={natural.width}
          naturalHeight={natural.height}
          onDone={(url) => {
            setCropping(false);
            onImageChange(url);
          }}
          onCancel={() => setCropping(false)}
        />
      )}
    </div>
  );
}