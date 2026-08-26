# 배경 지우개 (BG Remover)

서버 업로드 없이 브라우저에서 100% 로컬로 동작하는 이미지 배경 제거 도구.

- **배경 제거**: [@imgly/background-removal](https://github.com/imgly/background-removal-js) (AGPL-3.0)
- **자르기**: react-easy-crop
- **크기 조절 / 포맷 변환**: Canvas API (PNG · WebP · JPEG)
- **스택**: Vite + React 18 + TypeScript + Tailwind CSS

## 개발

npm install
npm run dev

> 최초 실행 시 AI 모델(~80MB)을 IMG.LY CDN에서 내려받습니다. 이후 브라우저에 캐시됩니다.

## 빌드

npm run build   # dist/ 에 정적 파일 생성

## Cloudflare Pages 배포

1. GitHub에 이 저장소를 push (⚠️ AGPL 의무 이행을 위해 **공개 저장소** 권장)
2. Cloudflare 대시보드 → Workers & Pages → Create → Pages → Connect to Git
3. 빌드 설정:
   - Framework preset: Vite
   - Build command: `npm run build`
   - Build output directory: `dist`

`public/_headers` 파일이 COOP/COEP 헤더를 설정해 `SharedArrayBuffer`(멀티스레드 가속)를 활성화합니다.
혹시 이 헤더 때문에 모델 로딩이 실패하면 해당 파일의 헤더 두 줄을 제거하세요 — 속도만 느려질 뿐 동작에는 문제 없습니다.

## 라이선스 관련

`@imgly/background-removal` 은 AGPL-3.0 라이선스입니다.
이 사이트를 공개 서비스로 운영하는 경우 소스코드를 공개해야 하므로,
이 저장소를 공개로 유지하고 사이트 푸터에 저장소 링크를 노출합니다.
상용(소스 비공개) 사용이 필요하면 IMG.LY(support@img.ly)의 별도 라이선스가 필요합니다.

## 라이선스

AGPL-3.0