# 🔗 Link-To-Me

YouTube 링크 리다이렉션 서비스 - 최신 기술 스택으로 구현

## 🚀 기술 스택

-   **Next.js 16** (App Router)
-   **React 19**
-   **TypeScript 5**
-   **Tailwind CSS 4**
-   **pnpm** (패키지 매니저)
-   **Turbopack** (개발 환경)
-   **Vercel** (배포)

## 📱 지원 기능

### 디바이스별 최적화된 리다이렉션

-   **iOS**: `youtube://` 스키마로 앱 직접 열기
-   **Android 일반 브라우저**: `intent://` URL로 앱 열기
-   **Android 인앱브라우저**: HTML 페이지로 다단계 앱 열기 시도
-   **Desktop**: YouTube 웹사이트로 리다이렉션

### 인앱브라우저 지원

-   Facebook, Instagram, KakaoTalk, Line 등 인앱브라우저 감지
-   각 환경에 최적화된 앱 열기 방식 제공
-   Fallback 메커니즘으로 안정성 보장

## 🏗️ API 라우팅

```
GET /api/[...path]
```

### 사용 예시

```
https://yourdomain.com/api/watch?v=dQw4w9WgXcQ
→ iOS: youtube://watch?v=dQw4w9WgXcQ
→ Android: intent://watch?v=dQw4w9WgXcQ#Intent;...
→ Desktop: https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

## 🛠️ 개발 환경 실행

```bash
# 개발 서버 시작 (Turbopack 사용)
pnpm dev

# 빌드
pnpm build

# 프로덕션 서버 시작
pnpm start

# 린팅
pnpm lint
```

## 🌐 Vercel 배포

### 1. Vercel CLI 설치 및 로그인

```bash
pnpm add -g vercel
vercel login
```

### 2. 프로젝트 배포

```bash
vercel
```

### 3. 프로덕션 배포

```bash
vercel --prod
```

## ⚙️ 환경 설정

### TypeScript 설정

-   최신 TypeScript 5 기능 활용
-   Next.js 16 타입 지원
-   엄격한 타입 체크 (`strict: true`)

---

**최신 기술 스택으로 구현된 YouTube 리다이렉션 서비스 🎯**
