import { useCallback, useEffect, useState } from 'react';
import { Eraser } from 'lucide-react';
import ImageUploader from './components/ImageUploader';
import OriginalPreview from './components/OriginalPreview';
import ProgressBar from './components/ProgressBar';
import EditView from './components/EditView';
import { removeImageBackground } from './lib/removeBackground';

type Step = 'upload' | 'preview' | 'processing' | 'edit';

export default function App() {
  const [step, setStep] = useState<Step>('upload');
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('준비 중…');
  const [error, setError] = useState<string | null>(null);

  // 업로드된 원본 (배경 제거 전)
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);

  // 편집 히스토리 (undo/redo)
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const imageUrl = historyIndex >= 0 ? history[historyIndex] ?? null : null;
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex >= 0 && historyIndex < history.length - 1;

  /** 새 편집 결과를 히스토리에 추가 (redo 분기는 버림) */
  const pushImage = useCallback(
    (url: string) => {
      setHistory((prev) => {
        prev.slice(historyIndex + 1).forEach((u) => URL.revokeObjectURL(u));
        return [...prev.slice(0, historyIndex + 1), url];
      });
      setHistoryIndex((i) => i + 1);
    },
    [historyIndex]
  );

  const undo = useCallback(() => {
    setHistoryIndex((i) => (i > 0 ? i - 1 : i));
  }, []);

  const redo = useCallback(() => {
    setHistoryIndex((i) => (i < history.length - 1 ? i + 1 : i));
  }, [history.length]);

  // Ctrl+Z / Ctrl+Y (Mac: Cmd) 단축키
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const key = e.key.toLowerCase();
      if (key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
      } else if (key === 'y' || (key === 'z' && e.shiftKey)) {
        e.preventDefault();
        if (canRedo) redo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [canUndo, canRedo, undo, redo]);

  /** 1단계: 파일 선택 → 원본 미리보기만 표시 */
  const handleFile = (file: File) => {
    setError(null);
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setOriginalFile(file);
    setOriginalUrl(URL.createObjectURL(file));
    setStep('preview');
  };

  /** 2단계: 배경 제거 버튼 클릭 시에만 실행 */
  const handleRemoveBackground = async () => {
    if (!originalFile) return;
    setError(null);
    setProgress(0);
    setProgressLabel('준비 중…');
    setStep('processing');
    try {
      const blob = await removeImageBackground(originalFile, (p, label) => {
        setProgress(p);
        setProgressLabel(label);
      });
      history.forEach((u) => URL.revokeObjectURL(u));
      setHistory([URL.createObjectURL(blob)]);
      setHistoryIndex(0);
      setStep('edit');
    } catch (e) {
      console.error(e);
      setError('배경 제거에 실패했습니다. 다른 이미지로 다시 시도해 주세요.');
      setStep('preview');
    }
  };

  const reset = () => {
    history.forEach((u) => URL.revokeObjectURL(u));
    setHistory([]);
    setHistoryIndex(-1);
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setOriginalFile(null);
    setOriginalUrl(null);
    setStep('upload');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4">
          <div className="rounded-lg bg-indigo-600 p-2">
            <Eraser className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">배경 지우개</h1>
            <p className="text-xs text-gray-500">
              서버 업로드 없는 100% 브라우저 배경 제거
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {step === 'upload' && <ImageUploader onSelect={handleFile} />}
        {step === 'preview' && originalUrl && originalFile && (
          <OriginalPreview
            imageUrl={originalUrl}
            fileName={originalFile.name}
            onRemoveBackground={handleRemoveBackground}
            onCancel={reset}
          />
        )}
        {step === 'processing' && (
          <ProgressBar percent={progress} label={progressLabel} />
        )}
        {step === 'edit' && imageUrl && (
          <EditView
            imageUrl={imageUrl}
            onImageChange={pushImage}
            onReset={reset}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
          />
        )}
      </main>

      <footer className="mx-auto max-w-5xl px-4 pb-8 text-center text-xs text-gray-400">
        <p>
          이 사이트는 AGPL-3.0 라이선스를 따릅니다 ·{' '}
          <a
            href="https://github.com/YOUR_GITHUB/YOUR_REPO"
            className="underline hover:text-gray-600"
            target="_blank"
            rel="noreferrer"
          >
            소스코드 보기
          </a>
        </p>
      </footer>
    </div>
  );
}