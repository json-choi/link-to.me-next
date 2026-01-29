import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getDeviceType, isSocialCrawler } from "@/utils/deviceDetection";
import { getYouTubeMetadata } from "@/utils/youtubeMetadata";
import { generateSocialMetaHtml } from "@/utils/htmlGenerator";
import { 
    parseYouTubeUrl, 
    getYouTubeWebUrl, 
    getAndroidIntentUrl, 
    getIosSchemeUrl 
} from "@/utils/urlProcessor";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        const { path } = await params;
        const headersList = await headers();
        const userAgent = headersList.get("user-agent") || "";
        
        // 1. URL 파싱
        const rawPath = path?.join("/") || "";
        const searchParams = request.nextUrl.searchParams;
        const rawQueryString = searchParams.toString();
        const fullPath = `${rawPath}${rawQueryString ? `?${rawQueryString}` : ""}`;
        
        // 루트 경로는 홈으로
        if (!rawPath) {
            return NextResponse.redirect("https://www.youtube.com", 302);
        }

        const urlInfo = parseYouTubeUrl(fullPath);
        const webUrl = getYouTubeWebUrl(urlInfo);

        // 2. 봇/크롤러 감지 -> 메타 태그 HTML 반환
        if (isSocialCrawler(userAgent)) {
            let metadata;
            try {
                metadata = await getYouTubeMetadata(webUrl);
            } catch (error) {
                console.error("Metadata fetch error:", error);
                metadata = {
                    title: "YouTube",
                    description: "YouTube에서 시청하세요",
                    thumbnail: "https://www.youtube.com/img/desktop/yt_1200.png",
                    url: webUrl,
                    type: "unknown" as const,
                };
            }
            
            const htmlContent = generateSocialMetaHtml(metadata, webUrl);
            return new NextResponse(htmlContent, {
                headers: {
                    "Content-Type": "text/html; charset=utf-8",
                    "Cache-Control": "public, max-age=3600",
                },
            });
        }

        // 3. 디바이스 감지
        const deviceType = getDeviceType(userAgent); // "ios" | "android" | "desktop"

        // 4. 데스크탑 -> 바로 웹으로 302
        if (deviceType === "desktop") {
            return NextResponse.redirect(webUrl, 302);
        }

        // 5. 모바일 (iOS/Android) -> 랜딩 페이지(/redirect)로 전달
        const androidIntent = getAndroidIntentUrl(urlInfo, webUrl);
        const iosScheme = getIosSchemeUrl(urlInfo);
        
        const host = headersList.get("host") || "localhost:3000";
        const protocol = headersList.get("x-forwarded-proto") || "https";
        const baseUrl = `${protocol}://${host}`;
        
        const redirectPageParams = new URLSearchParams({
            web: webUrl,
            android: androidIntent,
            ios: iosScheme,
            platform: deviceType
        });

        const redirectUrl = `${baseUrl}/redirect?${redirectPageParams.toString()}`;
        console.log(`Redirecting mobile user (${deviceType}) to: ${redirectUrl}`);

        return NextResponse.redirect(redirectUrl, 302);

    } catch (error) {
        console.error("Route error:", error);
        return NextResponse.redirect("https://www.youtube.com", 302);
    }
}
