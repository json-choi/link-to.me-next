/**
 * URL 처리 및 리다이렉트 URL 생성 유틸리티 (2025 Revised)
 */

import { YOUTUBE_WEB } from "./constants";

/**
 * YouTube URL 패턴 파싱 결과
 */
interface YouTubeUrlInfo {
    videoId?: string;
    playlistId?: string;
    channelId?: string;
    shortsId?: string;
    liveId?: string;
    query?: string;
    originalPath?: string;
}

/**
 * URL에서 YouTube 정보 추출
 * - 다양한 형태의 URL을 정규화하여 처리
 * - https:/youtube.com (슬래시 하나), https://youtube.com, youtube.com 등 모두 지원
 */
export const parseYouTubeUrl = (rawLink: string): YouTubeUrlInfo => {
    // 1. 강력한 URL 정규화
    let clean = rawLink
        // 앞뒤 공백 제거
        .trim()
        // 앞쪽 슬래시 제거
        .replace(/^\/+/, "")
        // 프로토콜 제거 (슬래시 1~2개 모두 처리): https:/ , https:// , http:/ , http://
        .replace(/^https?:\/{1,2}/i, "")
        // www. 제거
        .replace(/^www\./i, "")
        // m. (모바일) 제거
        .replace(/^m\./i, "")
        // youtube.com/ 또는 youtu.be/ 제거
        .replace(/^(youtube\.com|youtu\.be)\/?/i, "")
        // 다시 한번 앞쪽 슬래시 제거 (혹시 남아있으면)
        .replace(/^\/+/, "");

    // 2. 쿼리 스트링 분리
    const queryStart = clean.indexOf("?");
    const query = queryStart !== -1 ? clean.substring(queryStart) : "";
    const path = queryStart !== -1 ? clean.substring(0, queryStart) : clean;

    // 3. 패턴 매칭
    
    // Shorts: /shorts/VIDEO_ID
    if (path.startsWith("shorts/")) {
        const shortsId = path.replace("shorts/", "").split("/")[0];
        return { shortsId, query, originalPath: path };
    }

    // Live: /live/VIDEO_ID
    if (path.startsWith("live/")) {
        const liveId = path.replace("live/", "").split("/")[0];
        return { liveId, query, originalPath: path };
    }

    // Watch: /watch?v=VIDEO_ID
    if (path === "watch") {
        const params = new URLSearchParams(query);
        const v = params.get("v");
        const list = params.get("list");
        // watch?v=xxx&list=yyy 형태도 처리 (플레이리스트 내 영상)
        if (v) {
            // list가 있으면 query에서 제외하지 않고 그대로 전달 (영상 + 플레이리스트 컨텍스트)
            return { videoId: v, query, originalPath: path };
        }
    }

    // Playlist: /playlist?list=PLAYLIST_ID
    if (path === "playlist") {
        const params = new URLSearchParams(query);
        const list = params.get("list");
        if (list) {
            // si 파라미터만 유지 (공유 추적용, 선택적)
            const si = params.get("si");
            const cleanQuery = si ? `?list=${list}&si=${si}` : `?list=${list}`;
            return { playlistId: list, query: cleanQuery, originalPath: path };
        }
    }

    // Channel: /channel/CHANNEL_ID, /c/NAME, /user/NAME, /@HANDLE
    if (path.startsWith("channel/") || path.startsWith("c/") || path.startsWith("user/") || path.startsWith("@")) {
        return { channelId: path, query, originalPath: path };
    }

    // youtu.be 단축 URL: VIDEO_ID만 남은 경우 (11자)
    // 예: youtu.be/dQw4w9WgXcQ -> path = "dQw4w9WgXcQ"
    if (!path.includes("/") && /^[a-zA-Z0-9_-]{10,12}$/.test(path)) {
        return { videoId: path, query, originalPath: path };
    }

    // 기본값 (알 수 없는 패턴은 그대로 전달)
    return { originalPath: path, query };
};

/**
 * 표준 웹 URL 생성
 */
export const getYouTubeWebUrl = (info: YouTubeUrlInfo): string => {
    const base = "https://www.youtube.com";
    
    if (info.videoId) {
        const queryPart = info.query && info.query !== "?" ? info.query : "";
        return `${base}/watch?v=${info.videoId}${queryPart.startsWith("?") ? "&" + queryPart.substring(1) : queryPart}`;
    }
    if (info.shortsId) return `${base}/shorts/${info.shortsId}`;
    if (info.liveId) return `${base}/live/${info.liveId}`;
    if (info.playlistId) return `${base}/playlist${info.query || `?list=${info.playlistId}`}`;
    if (info.channelId) return `${base}/${info.channelId}${info.query || ""}`;
    
    return `${base}/${info.originalPath || ""}${info.query || ""}`;
};

/**
 * iOS용 URL Scheme 생성
 * - youtube:// 스키마 사용 (vnd.youtube:// 보다 호환성 좋음)
 */
export const getIosSchemeUrl = (info: YouTubeUrlInfo): string => {
    const base = "youtube://www.youtube.com";
    
    if (info.videoId) {
        const queryPart = info.query && info.query !== "?" ? info.query : "";
        return `${base}/watch?v=${info.videoId}${queryPart.startsWith("?") ? "&" + queryPart.substring(1) : queryPart}`;
    }
    if (info.shortsId) return `${base}/shorts/${info.shortsId}`;
    if (info.liveId) return `${base}/live/${info.liveId}`;
    if (info.playlistId) return `${base}/playlist${info.query || `?list=${info.playlistId}`}`;
    if (info.channelId) return `${base}/${info.channelId}${info.query || ""}`;
    
    return `${base}/${info.originalPath || ""}${info.query || ""}`;
};

/**
 * Android용 Intent URL 생성
 */
export const getAndroidIntentUrl = (info: YouTubeUrlInfo, fallbackWebUrl: string): string => {
    const packageId = "com.google.android.youtube";
    const fallback = `S.browser_fallback_url=${encodeURIComponent(fallbackWebUrl)}`;
    const suffix = `#Intent;scheme=https;package=${packageId};${fallback};end`;

    let path = "";
    
    if (info.videoId) {
        const queryPart = info.query && info.query !== "?" ? info.query : "";
        path = `www.youtube.com/watch?v=${info.videoId}${queryPart.startsWith("?") ? "&" + queryPart.substring(1) : queryPart}`;
    } else if (info.shortsId) {
        path = `www.youtube.com/shorts/${info.shortsId}`;
    } else if (info.liveId) {
        path = `www.youtube.com/live/${info.liveId}`;
    } else if (info.playlistId) {
        path = `www.youtube.com/playlist${info.query || `?list=${info.playlistId}`}`;
    } else if (info.channelId) {
        path = `www.youtube.com/${info.channelId}${info.query || ""}`;
    } else {
        path = `www.youtube.com/${info.originalPath || ""}${info.query || ""}`;
    }

    return `intent://${path}${suffix}`;
};
