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

    const isVideo = metadata.type === "video" || metadata.type === "shorts" || metadata.type === "live";
    const ogType = isVideo ? "video.other" : "website";
    const siteName = escapeHtml(metadata.siteName || "YouTube");

    const videoUrl = metadata.videoUrl 
        ? escapeHtml(metadata.videoUrl)
        : (metadata.videoId ? `https://www.youtube.com/embed/${escapeHtml(metadata.videoId)}` : null);

    const videoTags = isVideo && videoUrl ? `
    <meta property="og:video" content="${videoUrl}">
    <meta property="og:video:secure_url" content="${videoUrl}">
    <meta property="og:video:type" content="text/html">
    <meta property="og:video:width" content="1280">
    <meta property="og:video:height" content="720">` : "";

    return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <title>${title}</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${url}">
    
    <meta property="og:type" content="${ogType}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${thumbnail}">
    <meta property="og:image:width" content="1280">
    <meta property="og:image:height" content="720">
    <meta property="og:url" content="${url}">
    <meta property="og:site_name" content="${siteName}">${videoTags}
    
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${thumbnail}">
    
    <meta http-equiv="refresh" content="0; url=${safeRedirectUrl}">
</head>
<body>
    <p>YouTube로 이동 중...</p>
    <script>window.location.href="${safeRedirectUrl}";</script>
</body>
</html>`;
};
