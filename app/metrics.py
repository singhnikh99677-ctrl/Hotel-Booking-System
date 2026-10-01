from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST

REQUEST_COUNT = Counter(
    "http_requests_total",
    "Total HTTP requests",
    labelnames=("method", "endpoint", "status"),
)

REQUEST_LATENCY = Histogram(
    "http_request_duration_seconds",
    "HTTP request latency in seconds",
    labelnames=("method", "endpoint"),
)

__all__ = ["REQUEST_COUNT", "REQUEST_LATENCY", "generate_latest", "CONTENT_TYPE_LATEST"]
