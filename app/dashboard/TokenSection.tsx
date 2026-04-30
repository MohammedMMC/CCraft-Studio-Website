"use client";

import { useState, useTransition } from "react";
import Button from "@/components/Button";
import Image from "next/image";
import { refreshToken } from "./actions";

export default function TokenSection() {
    const [isRefreshingToken, startRefreshingTokenTransition] = useTransition();
    const [token, setToken] = useState<string | null>(null);

    async function handleRefreshToken() {
        const newToken = await refreshToken();
        setToken(newToken || null);
    }

    function handleCopyToken() {
        if (token) {
            navigator.clipboard.writeText(token);
        }
    }

    return (
        <div className="mt-4 flex flex-row gap-3">
            <input
                className="w-full px-3 py-3 text-sm"
                type="text"
                readOnly={true}
                value={token || "Click refresh to create a new token."}
            />
            <Button
                onClick={handleCopyToken}
                disabled={!token}
                className="w-fit justify-center gap-4!"
            >
                <Image className="select-none pointer-events-none drop-shadow-[0_2px_0] drop-shadow-lime" src="/icons/copy.svg" alt="Copy Icon" width={24} height={24} />
            </Button>
            <Button
                onClick={() => startRefreshingTokenTransition(() => handleRefreshToken())}
                className="w-fit justify-center gap-4!"
                disabled={isRefreshingToken}
            >
                <Image className="select-none pointer-events-none drop-shadow-[0_2px_0] drop-shadow-lime" src="/icons/refresh.svg" alt="Refresh Icon" width={24} height={24} />
            </Button>
            
        </div>
    );
}