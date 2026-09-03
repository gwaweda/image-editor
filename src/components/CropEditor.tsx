import { useRef, useState } from 'react';
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop as CropState,
  type PixelCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Check, X } from 'lucide-react';
import { cropToUrl } from '../lib/canvasUtils';

type Props = {
  imageUrl: string;
  naturalWidth: number;
  naturalHeight: number;
  onDone: (croppedUrl: string) => void;
  onCancel: () => void;
};

type AspectKey = 'free' | 'original' | number;

const ASPECTS: { label: string; value: AspectKey }[] = [
  { label: '자유', value: 'free' },
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
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<CropState>();
  const [completed, setCompleted] = useState<PixelCrop>();
  const [aspectKey, setAspectKey] = useState<AspectKey>('free');
  const [busy, setBusy] = useState(false);

  const resolveAspect = (key: AspectKey): number | undefined =>
    key === 'free'
      ? undefined
      : key === 'original'
        ? naturalWidth / naturalHeight
        : key;

  const aspect = resolveAspect(aspectKey);

  /** 이미지 로드 시 기본 선택 영역(가운데 80%) */
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(
      centerCrop(
        { unit: '%', x: 10, y: 10, width: 80, height: 80 },
        width,
        height
      )
    );
  };

  /** 비율 프리셋 변경 시 선택 영역을 해당 비율로 재설정 */
  /** 비율 프리셋 변경 시 해당 비율로 가능한 최대 영역을 선택 */
  const changeAspect = (key: AspectKey) => {
    setAspectKey(key);
    const img = imgRef.current;
    if (!img) return;
    if (key === 'original') {
      // 원본 비율 = 이미지 전체
      setCrop({ unit: '%', x: 0, y: 0, width: 100, height: 100 });
      return;
    }
    const a = resolveAspect(key);
    if (a) {
      setCrop(
        centerCrop(
          makeAspectCrop({ unit: '%', width: 100 }, a, img.width, img.height),
          img.width,
          img.height
        )
      );
    }
  };

  const confirm = async () => {
    const img = imgRef.current;
    if (!img || !completed || completed.width < 1 || completed.height < 1) return;
    setBusy(true);
    try {
      // 화면 표시 크기 → 원본 픽셀 좌표로 변환
      const scaleX = img.naturalWidth / img.width;
      const scaleY = img.naturalHeight / img.height;
      const url = await cropToUrl(imageUrl, {
        x: completed.x * scaleX,
        y: completed.y * scaleY,
        width: completed.width * scaleX,
        height: completed.height * scaleY,
      });
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
        {/* 투명 배경이 보이도록 체커보드 배경 */}
        <div className="flex items-center justify-center bg-gray-100 p-4">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompleted(c)}
            aspect={aspect}
            keepSelection
            className="checkerboard rounded-md border border-gray-400 shadow-sm"
          >
            <img
              ref={imgRef}
              src={imageUrl}
              alt="자르기 대상 이미지"
              onLoad={onImageLoad}
              style={{
                maxHeight: '60vh',
                maxWidth: 'calc(min(42rem, 100vw - 2rem) - 2rem)',
              }}
              className="object-contain"
            />
          </ReactCrop>
        </div>
        <div className="flex flex-col gap-4 border-t border-gray-100 p-4">
          <div className="flex flex-wrap gap-2">
            {ASPECTS.map((a) => (
              <button
                key={a.label}
                onClick={() => changeAspect(a.value)}
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
          <div className="flex justify-end gap-2">
            <button
              onClick={onCancel}
              className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              <X className="h-4 w-4" /> 취소
            </button>
            <button
              onClick={confirm}
              disabled={busy || !completed || completed.width < 1}
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