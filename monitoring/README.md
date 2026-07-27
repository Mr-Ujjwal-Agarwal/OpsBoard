# 📊 Monitoring Stack

This directory contains the monitoring and observability resources used by **OpsBoard**.

The monitoring stack is responsible for collecting metrics, visualizing system health, and centralizing application logs to improve operational visibility and simplify troubleshooting.

For detailed monitoring architecture and observability concepts, refer to **`docs/MONITORING.md`**.

---

# 📖 Overview

OpsBoard follows a modern cloud-native observability approach built around three core components:

- **Prometheus** for metrics collection
- **Grafana** for dashboards and visualization
- **Loki** for centralized log aggregation

Together, these services provide real-time insights into application health, infrastructure performance, and operational events.

---

# 🏗️ Monitoring Architecture

```text
                 Amazon EKS
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
   Application     Kubernetes     Nodes
      Metrics        Metrics      Metrics
        │             │             │
        └─────────────┼─────────────┘
                      │
                      ▼
                Prometheus
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
     Grafana                     Loki
        │                           │
        ▼                           ▼
 Dashboards                Centralized Logs
```

---

# 📂 Directory Structure

```text
monitoring/
│
├── README.md
├── prometheus.md
├── grafana.md
└── loki.md
```

Each document describes the purpose and role of an individual monitoring component within the OpsBoard platform.

---

# 🔧 Components

## 📈 Prometheus

Responsible for collecting and storing time-series metrics from Kubernetes workloads and infrastructure.

Typical metrics include:

- CPU utilization
- Memory consumption
- Pod status
- Node health
- Container metrics
- Application metrics

---

## 📊 Grafana

Provides dashboards that transform raw metrics into meaningful visualizations.

Dashboards help monitor:

- Cluster health
- Resource utilization
- Application performance
- Deployment status
- Infrastructure trends

---

## 📝 Loki

Centralizes application and infrastructure logs.

Logs can be correlated with metrics to simplify incident investigation and root cause analysis.

---

# 🎯 Monitoring Objectives

The monitoring stack is designed to:

- Improve platform visibility
- Detect operational issues early
- Support performance analysis
- Reduce Mean Time to Detect (MTTD)
- Reduce Mean Time to Recovery (MTTR)
- Simplify troubleshooting

---

# 🔄 Monitoring Workflow

```text
Application
      │
      ▼
Generate Metrics & Logs
      │
      ├─────────────► Prometheus
      │                     │
      │                     ▼
      │                Grafana
      │
      └─────────────► Loki
                            │
                            ▼
                    Incident Investigation
```

---

# 📁 Related Documentation

For additional information, refer to:

- `docs/MONITORING.md`
- `prometheus.md`
- `grafana.md`
- `loki.md`

---

# 🚀 Future Enhancements

Future improvements may include:

- Alertmanager integration
- Distributed tracing
- Custom Grafana dashboards
- Kubernetes recording rules
- Service Level Objectives (SLOs)
- AI-assisted anomaly detection

---

# 📌 Summary

The monitoring directory contains the core observability documentation for OpsBoard.

By combining Prometheus, Grafana, and Loki, the platform provides comprehensive monitoring, visualization, and logging capabilities that support reliable cloud-native operations.
