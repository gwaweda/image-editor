import { removeBackground } from '@imgly/background-removal';

export type ProgressHandler = (percent: number, label: string) => void;

/**
 * 이미지 배경 제거 래퍼.
 * - 첫 실행 시 모델(~80MB)과 WASM을 다운로드하므로 progress 콜백으로 진행률을 표시한다.
 * - 결과는 투명 배경 PNG Blob.
 */
export async function removeImageBackground(
  file: File | Blob,
  onProgress?: ProgressHandler
): Promise<Blob> {
  return removeBackground(file, {
    model: 'isnet',
    progress: (key, current, total) => {
      if (!onProgress) return;
      const percent = total > 0 ? Math.round((current / total) * 100) : 100;
      const label = key.startsWith('fetch')
        ? 'AI 모델 준비 중'
        : '이미지 처리 중';
      onProgress(percent, label);
    },
    output: {
      format: 'image/png',
      quality: 1,
    },
  });
}