import { useState } from 'react';
import Cropper from 'react-easy-crop';
import { Check, X } from 'lucide-react';
import type { Area } from '../lib/canvasUtils';
import { cropToUrl } from '../lib/canvasUtils';

type Props = {
  imageUrl: string;
  naturalWidth: number;
  naturalHeight: number;
  onDone: (croppedUrl: string) => void;
  onCancel: () => void;
};

const ASPECTS: { label: string; value: number | 'original' }[] = [
  { label: '원본 비율', value: 'original' },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:4', value: 3 / 4 },
  { label: '16:9', value: 16 / 9 },
];

export default function CropEditor({
  imageUrl,
  naturalWidth,
  naturalHeight,
  onDone,
  onCancel,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspectKey, setAspectKey] = useState<number | 'original'>('original');
  const [areaPixels, setAreaPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  const aspect =
    aspectKey === 'original' ? naturalWidth / naturalHeight : aspectKey;

  const confirm = async () => {
    if (!areaPixels) return;
    setBusy(true);
    try {
      const url = await cropToUrl(imageUrl, areaPixels);
      onDone(url);
    } catch (e) {
      alert(e instanceof Error ? e.message : '자르기에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="relative h-[400px] bg-gray-900">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_area, pixels) => setAreaPixels(pixels)}
          />
        </div>
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-wrap gap-2">
            {ASPECTS.map((a) => (
              <button
                key={a.label}
                onClick={() => setAspectKey(a.value)}
                className={
                  aspectKey === a.value
                    ? 'rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white'
                    : 'rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200'
                }
              >
                {a.label}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-3 text-sm text-gray-600">
            확대
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-indigo-600"
            />
          </label>
          <div className="flex justify-end gap-2">
            <button
              onClick={onCancel}
              className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              <X className="h-4 w-4" /> 취소
            </button>
            <button
              onClick={confirm}
              disabled={busy || !areaPixels}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              <Check className="h-4 w-4" /> {busy ? '적용 중…' : '자르기 적용'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}