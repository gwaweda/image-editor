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

## 라이선스

AGPL-3.0 — [LICENSE](./LICENSE) 참고

이 프로젝트는 [@imgly/background-removal](https://github.com/imgly/background-removal-js)(AGPL-3.0)을 사용하므로,
공개 서비스 운영 시 소스코드 공개 의무가 있어 이 저장소를 공개로 유지합니다.
상용(소스 비공개) 사용이 필요하면 IMG.LY(support@img.ly)의 별도 라이선스가 필요합니다.