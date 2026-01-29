export interface YouTubeMetadata {
    title: string;
    description: string;
    thumbnail: string;
    url: string;
    type: "video" | "playlist" | "channel" | "shorts" | "live" | "unknown";
    videoId?: string;
    siteName?: string;
    videoUrl?: string;
}

const extractMetaContent = (html: string, property: string): string | null => {
    const patterns = [
        new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
        new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, "i"),
        new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
        new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`, "i"),
    ];
    
    for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match) return match[1];
    }
    return null;
};

const extractTitle = (html: string): string | null => {
    const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return match ? match[1] : null;
};

const getContentType = (url: string): YouTubeMetadata["type"] => {
    if (url.includes("/shorts/")) return "shorts";
    if (url.includes("/live/")) return "live";
    if (url.includes("/watch") || url.includes("youtu.be/")) return "video";
    if (url.includes("/playlist")) return "playlist";
    if (url.includes("/channel/") || url.includes("/@") || url.includes("/c/")) return "channel";
    return "unknown";
};

const extractVideoId = (url: string): string | null => {
    const patterns = [
        /youtube\.com\/watch\?v=([^&\n?#]+)/,
        /youtu\.be\/([^&\n?#]+)/,
        /youtube\.com\/embed\/([^&\n?#]+)/,
        /youtube\.com\/shorts\/([^&\n?#]+)/,
        /youtube\.com\/live\/([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
};

export const getYouTubeMetadata = async (webUrl: string): Promise<YouTubeMetadata> => {
    const type = getContentType(webUrl);
    const videoId = extractVideoId(webUrl);
    
    try {
        const response = await fetch(webUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
                "Accept": "text/html",
                "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
            },
            signal: AbortSignal.timeout(8000),
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const html = await response.text();

        const ogTitle = extractMetaContent(html, "og:title");
        const ogDescription = extractMetaContent(html, "og:description");
        const ogImage = extractMetaContent(html, "og:image");
        const ogUrl = extractMetaContent(html, "og:url");
        const ogSiteName = extractMetaContent(html, "og:site_name");
        const ogVideo = extractMetaContent(html, "og:video:url") || extractMetaContent(html, "og:video");
        const twitterTitle = extractMetaContent(html, "twitter:title");
        const twitterDescription = extractMetaContent(html, "twitter:description");
        const twitterImage = extractMetaContent(html, "twitter:image");
        const pageTitle = extractTitle(html);

        return {
            title: ogTitle || twitterTitle || pageTitle || "YouTube",
            description: ogDescription || twitterDescription || "",
            thumbnail: ogImage || twitterImage || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "https://www.youtube.com/img/desktop/yt_1200.png"),
            url: ogUrl || webUrl,
            type,
            videoId: videoId || undefined,
            siteName: ogSiteName || "YouTube",
            videoUrl: ogVideo || undefined,
        };
    } catch (error) {
        console.error("메타데이터 스크래핑 실패:", error);
        
        return {
            title: "YouTube",
            description: "",
            thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "https://www.youtube.com/img/desktop/yt_1200.png",
            url: webUrl,
            type,
            videoId: videoId || undefined,
        };
    }
};
