# Using Prometheus Metrics in Grafana

## 1. Start Your Monitoring Stack

```bash
docker-compose -f docker-compose-monitoring.yml up -d
```

## 2. Access Grafana

- URL: `http://localhost:3000`
- Username: `admin`
- Password: `admin`

## 3. Add Prometheus as Data Source

1. Go to Configuration → Data Sources
2. Add data source → Prometheus
3. URL: `http://prometheus:9090` (Docker networking)
4. Save & Test

## 4. Import Your Dashboard

Your `grafana-dashboard.json` is already configured. Import it via:

- Create → Import → Upload JSON file
- Or use the pre-configured dashboard at `http://localhost:3000/d/payment-method-service`

## 5. Key Metrics in Your Dashboard

Your dashboard includes these panels:

### HTTP Request Rate (`grafana-dashboard.json:95`)

```promql
rate(http_requests_total[5m])
```

### Request Duration (`grafana-dashboard.json:177`)

```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))
```

### Active Requests (`grafana-dashboard.json:242`)

```promql
http_requests_active
```

### Status Code Distribution (`grafana-dashboard.json:296`)

```promql
sum by (status_code) (rate(http_requests_total[5m]))
```

### System Metrics (`grafana-dashboard.json:378-384`)

```promql
process_resident_memory_bytes
process_cpu_seconds_total
```

## 6. Common Prometheus Query Patterns

### Rate of requests

```promql
rate(http_requests_total[5m])
```

### 95th percentile latency

```promql
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))
```

### Error rate

```promql
rate(http_requests_total{status_code=~"5.."}[5m])
```

### Memory usage

```promql
process_resident_memory_bytes
```

## Configuration Details

Your Prometheus is configured to scrape:

- Your service at `localhost:8888/metrics` every 5 seconds
- Prometheus itself at `localhost:9090`
- Node Exporter at `localhost:9100` (if available)
- Loki metrics at `localhost:3100/metrics`

## File References

- Prometheus config: `prometheus.yml`
- Grafana dashboard: `grafana-dashboard.json`
- Docker compose: `docker-compose-monitoring.yml`
