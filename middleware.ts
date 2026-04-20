import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login"];

const ROLE_PROTECTED_PREFIXES: Array<{ prefix: string; roles: string[] }> = [
    { prefix: "/admin", roles: ["admin", "super_admin"] },
];

function isPublicPath(pathname: string) {
    return PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

function getUserRole(request: NextRequest): string | null {
    const raw = request.cookies.get("user_data")?.value;
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw) as { role?: string };
        return parsed.role ?? null;
    } catch {
        return null;
    }
}

function buildProdCsp(nonce: string) {
    const apiOrigin = (() => {
        try {
            return new URL(process.env.NEXT_PUBLIC_API_URL ?? "").origin;
        } catch {
            return "";
        }
    })();

    return [
        `default-src 'self'`,
        `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
        `style-src 'self' 'unsafe-inline'`,
        `img-src 'self' data: blob:`,
        `font-src 'self' data:`,
        `connect-src 'self'${apiOrigin ? ` ${apiOrigin}` : ""}`,
        `frame-ancestors 'none'`,
        `form-action 'self'`,
        `base-uri 'self'`,
        `object-src 'none'`,
        `upgrade-insecure-requests`,
    ].join("; ");
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const accessToken = request.cookies.get("access_token")?.value;
    const isProd = process.env.NODE_ENV === "production";

    const publicPath = isPublicPath(pathname);

    if (!accessToken && !publicPath) {
        const url = new URL("/login", request.url);
        return NextResponse.redirect(url);
    }

    if (accessToken && pathname === "/login") {
        const url = new URL("/", request.url);
        return NextResponse.redirect(url);
    }

    if (accessToken) {
        const role = getUserRole(request);
        const guarded = ROLE_PROTECTED_PREFIXES.find(({ prefix }) =>
            pathname.startsWith(prefix)
        );
        if (guarded && (!role || !guarded.roles.includes(role))) {
            const url = new URL("/", request.url);
            return NextResponse.redirect(url);
        }
    }

    // CSP solo en producción. En dev, Turbopack/HMR inyecta recursos dinámicos
    // que no siempre respetan el nonce y rompen la app. El resto de headers
    // (HSTS, XFO, nosniff, etc.) vienen estáticos desde next.config.mjs.
    if (!isProd) {
        return NextResponse.next();
    }

    const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
    const csp = buildProdCsp(nonce);

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("content-security-policy", csp);

    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set("content-security-policy", csp);
    return response;
}

export const config = {
    matcher: [
        {
            source:
                "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|icon-.*\\.png|apple-icon\\.png|icon\\.svg).*)",
            missing: [
                { type: "header", key: "next-router-prefetch" },
                { type: "header", key: "purpose", value: "prefetch" },
            ],
        },
    ],
};
