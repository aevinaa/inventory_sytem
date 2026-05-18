import time
import logging
from fastapi import Request

logger = logging.getLogger("uvicorn.access")


class RequestLoggingMiddleware:
    """
    Logs every request: method, path, status code, and how long it took.
    Example log line: POST /api/v1/auth/login  200  45ms
    """

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        request = Request(scope)
        start = time.perf_counter()
        status_code = 500

        async def send_wrapper(message):
            nonlocal status_code
            if message["type"] == "http.response.start":
                status_code = message["status"]
            await send(message)

        await self.app(scope, receive, send_wrapper)

        duration_ms = (time.perf_counter() - start) * 1000
        logger.info(
            f"{request.method} {request.url.path}  {status_code}  {duration_ms:.1f}ms"
        )