"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function RedirectContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const webUrl = searchParams.get("web") || "";
    const androidIntent = searchParams.get("android") || "";
    const iosScheme = searchParams.get("ios") || "";
    const platform = searchParams.get("platform") || "android";

    useEffect(() => {
        if (!webUrl) {
            router.replace("/");
        }
    }, [webUrl, router]);

    const handleOpenApp = () => {
        const appUrl = platform === "ios" ? iosScheme : androidIntent;
        
        if (!appUrl) {
            window.location.href = webUrl;
            return;
        }

        window.location.href = appUrl;
        
        setTimeout(() => {
            window.location.href = webUrl;
        }, 2000);
    };

    const handleOpenWeb = () => {
        window.location.href = webUrl;
    };

    if (!webUrl) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-gray-700 border-t-red-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-5">
            <div className="max-w-sm w-full text-center">
                <div className="w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a2.999 2.999 0 00-2.109-2.109C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.389.531A2.999 2.999 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.999 2.999 0 002.109 2.109C4.495 20.454 12 20.454 12 20.454s7.505 0 9.389-.531a2.999 2.999 0 002.109-2.109C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
                    </svg>
                </div>

                <button
                    onClick={handleOpenApp}
                    className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 active:scale-[0.98] text-white font-bold py-4 px-6 rounded-xl transition-all text-lg"
                >
                    YouTube 앱으로 열기
                </button>
                
                <button
                    onClick={handleOpenWeb}
                    className="w-full mt-4 py-3 text-gray-400 hover:text-white text-sm font-medium transition-colors"
                >
                    브라우저에서 열기
                </button>
            </div>
        </div>
    );
}

export default function RedirectPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-gray-700 border-t-red-600 rounded-full animate-spin"></div>
            </div>
        }>
            <RedirectContent />
        </Suspense>
    );
}
