import logging
import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.time()
        
        request_id = getattr(request.state, "request_id", "unknown")
        
        response = await call_next(request)
        
        process_time_ms = (time.time() - start_time) * 1000
        
        logger.info(
            f"{request.method} {request.url.path} -> {response.status_code} "
            f"({process_time_ms:.2f}ms) [{request_id}]"
        )
        
        return response
