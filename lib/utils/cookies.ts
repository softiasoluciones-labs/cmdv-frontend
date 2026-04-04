/**
 * Cookie Utilities
 * Secure cookie management for authentication tokens
 */

export interface CookieOptions {
    maxAge?: number; // in seconds
    path?: string;
    secure?: boolean;
    sameSite?: "strict" | "lax" | "none";
    httpOnly?: boolean;
}

/**
 * Set a cookie with secure defaults
 */
export function setCookie(
    name: string,
    value: string,
    options: CookieOptions = {}
): void {
    const {
        maxAge = 60 * 60 * 24 * 7, // 7 days default
        path = "/",
        secure = process.env.NODE_ENV === "production",
        sameSite = "strict",
    } = options;

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (maxAge) {
        cookieString += `; max-age=${maxAge}`;
    }

    cookieString += `; path=${path}`;

    if (secure) {
        cookieString += "; secure";
    }

    cookieString += `; samesite=${sameSite}`;

    document.cookie = cookieString;
}

/**
 * Get a cookie by name
 */
export function getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;

    const nameEQ = encodeURIComponent(name) + "=";
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        while (cookie.charAt(0) === " ") {
            cookie = cookie.substring(1, cookie.length);
        }
        if (cookie.indexOf(nameEQ) === 0) {
            return decodeURIComponent(
                cookie.substring(nameEQ.length, cookie.length)
            );
        }
    }

    return null;
}

/**
 * Delete a cookie by name
 */
export function deleteCookie(name: string, path: string = "/"): void {
    document.cookie = `${encodeURIComponent(name)}=; path=${path}; max-age=0`;
}

/**
 * Check if a cookie exists
 */
export function hasCookie(name: string): boolean {
    return getCookie(name) !== null;
}
