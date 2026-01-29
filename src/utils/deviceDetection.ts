/**
 * 디바이스 및 브라우저 감지 유틸리티
 */

/**
 * User-Agent에서 디바이스 타입 확인
 */
export const getDeviceType = (userAgent: string): string => {
    const ua = userAgent.toLowerCase();

    if (/iphone|ipad|ipod/.test(ua)) return "ios";
    if (/android/.test(ua)) return "android";

    return "desktop";
};

/**
 * 소셜 미디어 크롤러/봇 감지
 * - 카카오톡, 페이스북 등의 링크 미리보기 봇
 * - 실제 사용자(인앱브라우저)와 구분 필요
 */
export const isSocialCrawler = (userAgent: string): boolean => {
    const ua = userAgent.toLowerCase();

    // 크롤러/봇 패턴 (미리보기 생성용)
    const crawlerPatterns = [
        "kakaotalk-scrap",      // 카카오톡 스크래퍼
        "kakao",                // 카카오 일반 (봇일 가능성)
        "facebookexternalhit",  // Facebook 크롤러
        "facebot",              // Facebook 봇
        "twitterbot",           // Twitter 봇
        "linkedinbot",          // LinkedIn 봇
        "telegrambot",          // Telegram 봇
        "slackbot",             // Slack 봇
        "discordbot",           // Discord 봇
        "whatsapp",             // WhatsApp 미리보기
        "applebot",             // Apple 봇
        "googlebot",            // Google 봇
        "bingbot",              // Bing 봇
        "yandexbot",            // Yandex 봇
        "baiduspider",          // Baidu 봇
        "daumoa",               // Daum 크롤러
        "yeti",                 // Naver 크롤러
        "naverbot",             // Naver 봇
        "pinterestbot",         // Pinterest 봇
        "pinterest/",           // Pinterest 앱 크롤러
        "snapchat",             // Snapchat 미리보기
        "linebot",              // Line 봇
        "line-poker",           // Line URL 미리보기
    ];

    // 인앱브라우저 패턴 (실제 사용자) - 이건 크롤러가 아님
    const inAppBrowserPatterns = [
        "kakaotalk/",           // 카카오톡 인앱브라우저 (버전 포함)
        "inapp",                // 인앱 표시
        "fban",                 // Facebook 앱
        "fbav",                 // Facebook 앱
        "instagram",            // Instagram 앱
    ];

    // 인앱브라우저인 경우 크롤러 아님
    const isInApp = inAppBrowserPatterns.some(p => ua.includes(p));
    if (isInApp) {
        // 단, "kakaotalk-scrap"은 크롤러임
        if (!ua.includes("kakaotalk-scrap")) {
            return false;
        }
    }

    const isCrawler = crawlerPatterns.some(p => ua.includes(p));
    
    console.log("크롤러 감지:", { ua: ua.substring(0, 100), isCrawler, isInApp });
    
    return isCrawler;
};
