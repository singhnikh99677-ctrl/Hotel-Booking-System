# Monitoring Setup

Prometheus is configured to scrape the FastAPI metrics endpoint at `http://hotel-api:8000/metrics`.

## Start the stack

```bash
docker compose up --build
```

## Verify Prometheus

Open: http://localhost:9090

Check the `hotel-api` target and verify metrics are being scraped.

## Grafana

Open: http://localhost:3000

1. Log in with the default Grafana credentials.
2. Add Prometheus as a data source using `http://prometheus:9090`.
3. Create a simple dashboard using queries such as:
   - `rate(http_requests_total[5m])`
   - `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))`

These metrics help visualize request volume and latency.
