/**
 * HTML 응답 생성 유틸리티
 * - 소셜 미디어 크롤러용 메타 태그 생성
 */

import { YouTubeMetadata } from "./youtubeMetadata";

/**
 * XSS 방지를 위한 HTML 이스케이프
 */
const escapeHtml = (str: string): string => {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

/**
 * 소셜 미디어 크롤러용 HTML 응답 생성
 * - Open Graph (Facebook, KakaoTalk, Line 등)
 * - Twitter Card
 */
export const generateSocialMetaHtml = (
    metadata: YouTubeMetadata,
    redirectUrl: string
): string => {
    const title = escapeHtml(metadata.title);
    const description = escapeHtml(metadata.description);
    const thumbnail = escapeHtml(metadata.thumbnail);
    const url = escapeHtml(metadata.url);
    const safeRedirectUrl = escapeHtml(redirectUrl);

    // 콘텐츠 타입에 따른 OG type 설정
    const ogType = metadata.type === "video" || metadata.type === "shorts" || metadata.type === "live" 
        ? "video.other" 
        : "website";

    return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- 기본 메타데이터 -->
    <title>${title}</title>
    <meta name="description" content="${description}">
    
    <!-- Open Graph (Facebook, KakaoTalk, Line 등) -->
    <meta property="og:type" content="${ogType}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${thumbnail}">
    <meta property="og:image:width" content="1280">
    <meta property="og:image:height" content="720">
    <meta property="og:url" content="${url}">
    <meta property="og:site_name" content="YouTube">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${thumbnail}">
    
    <!-- 크롤러가 아닌 실제 사용자는 리다이렉트 -->
    <meta http-equiv="refresh" content="0; url=${safeRedirectUrl}">
</head>
<body>
    <p>YouTube로 이동 중...</p>
    <script>window.location.href="${safeRedirectUrl}";</script>
</body>
</html>`;
};
