"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function RedirectContent() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<"loading" | "manual">("loading");

    const webUrl = searchParams.get("web") || "";
    const androidIntent = searchParams.get("android") || "";
    const iosScheme = searchParams.get("ios") || "";
    const platform = searchParams.get("platform") || "android";

    useEffect(() => {
        if (!webUrl) {
            window.location.href = "/";
            return;
        }

        const tryRedirect = async () => {
            // 1. 자동 실행 시도
            if (platform === "android" && androidIntent) {
                window.location.href = androidIntent;
            } else if (platform === "ios" && iosScheme) {
                window.location.href = iosScheme;
            } else {
                window.location.href = webUrl;
            }

            // 2. 약간의 지연 후 수동 모드로 전환 (앱이 안 열렸을 경우를 대비)
            // 브라우저가 앱으로 전환되면 이 타이머는 사실상 의미가 없어지거나
            // 사용자가 다시 브라우저로 돌아왔을 때 수동 버튼이 보이게 됨
            setTimeout(() => {
                setStatus("manual");
            }, 1500);
        };

        tryRedirect();
    }, [webUrl, androidIntent, iosScheme, platform]);

    const handleManualOpen = () => {
        if (platform === "android" && androidIntent) {
            window.location.href = androidIntent;
        } else if (platform === "ios" && iosScheme) {
            window.location.href = iosScheme;
        } else {
            window.location.href = webUrl;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
            <div className="bg-white max-w-md w-full p-8 rounded-xl shadow-lg text-center">
                <div className="mb-8">
                    <div className="w-16 h-16 bg-red-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a2.999 2.999 0 00-2.109-2.109C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.389.531A2.999 2.999 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.999 2.999 0 002.109 2.109C4.495 20.454 12 20.454 12 20.454s7.505 0 9.389-.531a2.999 2.999 0 002.109-2.109C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">YouTube 열기</h1>
                    <p className="text-gray-500 text-sm">
                        {platform === "ios" ? "iOS" : "Android"} 앱으로 이동합니다
                    </p>
                </div>

                {status === "loading" ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="w-10 h-10 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 animate-pulse">앱을 실행하는 중...</p>
                    </div>
                ) : (
                    <div className="space-y-3 animate-fade-in">
                        <button
                            onClick={handleManualOpen}
                            className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                        >
                            <span>앱으로 열기</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </button>
                        
                        <a
                            href={webUrl}
                            className="block w-full py-4 text-gray-500 hover:text-gray-800 text-sm font-medium transition-colors hover:underline"
                        >
                            브라우저에서 계속하기
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function RedirectPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-5">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin"></div>
            </div>
        }>
            <RedirectContent />
        </Suspense>
    );
}
