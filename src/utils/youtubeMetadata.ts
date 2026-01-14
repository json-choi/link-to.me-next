/**
 * YouTube 메타데이터 처리 유틸리티
 * - 비디오, 플레이리스트, 채널 등 다양한 콘텐츠 지원
 */

export interface YouTubeMetadata {
    title: string;
    description: string;
    thumbnail: string;
    url: string;
    type: "video" | "playlist" | "channel" | "shorts" | "live" | "unknown";
}

/**
 * YouTube URL에서 콘텐츠 정보 추출
 */
const parseYouTubeContent = (url: string): { type: string; id: string | null } => {
    // Video ID
    const videoPatterns = [
        /youtube\.com\/watch\?v=([^&\n?#]+)/,
        /youtu\.be\/([^&\n?#]+)/,
        /youtube\.com\/embed\/([^&\n?#]+)/,
        /youtube\.com\/shorts\/([^&\n?#]+)/,
        /youtube\.com\/live\/([^&\n?#]+)/,
    ];

    for (const pattern of videoPatterns) {
        const match = url.match(pattern);
        if (match) {
            if (url.includes("/shorts/")) return { type: "shorts", id: match[1] };
            if (url.includes("/live/")) return { type: "live", id: match[1] };
            return { type: "video", id: match[1] };
        }
    }

    // Playlist ID
    const playlistMatch = url.match(/[?&]list=([^&\n?#]+)/);
    if (playlistMatch || url.includes("/playlist")) {
        const listId = playlistMatch?.[1] || url.match(/playlist\?list=([^&]+)/)?.[1];
        return { type: "playlist", id: listId || null };
    }

    // Channel
    const channelPatterns = [
        /youtube\.com\/channel\/([^\/\n?#]+)/,
        /youtube\.com\/@([^\/\n?#]+)/,
        /youtube\.com\/c\/([^\/\n?#]+)/,
    ];

    for (const pattern of channelPatterns) {
        const match = url.match(pattern);
        if (match) return { type: "channel", id: match[1] };
    }

    return { type: "unknown", id: null };
};

/**
 * YouTube 메타데이터 가져오기
 * - oEmbed API (비디오용)
 * - 플레이리스트/채널은 기본 메타데이터 반환 (API 키 없이는 상세 정보 불가)
 */
export const getYouTubeMetadata = async (webUrl: string): Promise<YouTubeMetadata> => {
    const { type, id } = parseYouTubeContent(webUrl);
    
    console.log("메타데이터 파싱:", { webUrl, type, id });

    // 비디오/Shorts/Live: oEmbed API 사용
    if ((type === "video" || type === "shorts" || type === "live") && id) {
        try {
            const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(webUrl)}&format=json`;
            const response = await fetch(oembedUrl, { 
                headers: { "User-Agent": "Mozilla/5.0" },
                signal: AbortSignal.timeout(5000)
            });

            if (response.ok) {
                const data = await response.json();
                return {
                    title: data.title || "YouTube 동영상",
                    description: data.author_name ? `${data.author_name}님의 동영상` : "YouTube에서 시청하세요",
                    thumbnail: data.thumbnail_url || `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
                    url: webUrl,
                    type: type as "video" | "shorts" | "live",
                };
            }
        } catch (error) {
            console.error("oEmbed 실패:", error);
        }

        // oEmbed 실패 시 기본 썸네일
        return {
            title: "YouTube 동영상",
            description: "YouTube에서 시청하세요",
            thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
            url: webUrl,
            type: type as "video" | "shorts" | "live",
        };
    }

    // 플레이리스트
    if (type === "playlist" && id) {
        return {
            title: "YouTube 재생목록",
            description: "YouTube 재생목록을 확인하세요",
            thumbnail: "https://www.youtube.com/img/desktop/yt_1200.png",
            url: webUrl,
            type: "playlist",
        };
    }

    // 채널
    if (type === "channel" && id) {
        return {
            title: `YouTube 채널`,
            description: "YouTube 채널을 방문하세요",
            thumbnail: "https://www.youtube.com/img/desktop/yt_1200.png",
            url: webUrl,
            type: "channel",
        };
    }

    // 기본값
    return {
        title: "YouTube",
        description: "YouTube에서 시청하세요",
        thumbnail: "https://www.youtube.com/img/desktop/yt_1200.png",
        url: webUrl,
        type: "unknown",
    };
};
