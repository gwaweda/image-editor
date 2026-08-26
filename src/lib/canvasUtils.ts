export type Area = { x: number; y: number; width: number; height: number };

export type ExportFormat = 'image/png' | 'image/webp' | 'image/jpeg';

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('이미지를 불러올 수 없습니다.'));
    img.src = url;
  });
}

/** 지정 영역으로 잘라 새 Object URL(PNG) 반환 */
export async function cropToUrl(url: string, area: Area): Promise<string> {
  const img = await loadImage(url);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(area.width));
  canvas.height = Math.max(1, Math.round(area.height));
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(
    img,
    area.x, area.y, area.width, area.height,
    0, 0, canvas.width, canvas.height
  );
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(URL.createObjectURL(blob));
      else reject(new Error('자르기에 실패했습니다.'));
    }, 'image/png');
  });
}

/** 크기 조절 + 포맷 변환하여 Blob 반환 (JPEG는 투명 배경을 흰색으로 채움) */
export async function exportImage(
  url: string,
  width: number,
  height: number,
  format: ExportFormat,
  quality = 0.92
): Promise<Blob> {
  const img = await loadImage(url);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext('2d')!;
  if (format === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('내보내기에 실패했습니다.'))),
      format,
      quality
    );
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}