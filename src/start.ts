import { createMiddleware, createStart } from "@tanstack/react-start";
import { authMiddleware } from "@/middleware/auth";

const loggingMiddleware = createMiddleware().server(({ next, request }) => {
    const url = new URL(request.url);

    console.log(`[${request.method}] ${url.pathname} ${url.search}`);

    return next();
});

export const startInstance = createStart(() => {
    return {
        requestMiddleware: [loggingMiddleware, authMiddleware],
    };
});
