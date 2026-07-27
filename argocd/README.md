# 🚀 Argo CD Configuration

This directory contains the GitOps configuration used by **OpsBoard** for deploying and synchronizing Kubernetes resources on Amazon EKS.

Argo CD continuously monitors the Git repository and ensures that the cluster state matches the desired state defined in version-controlled manifests.

---

# 📖 Overview

OpsBoard follows a GitOps deployment strategy where Git serves as the single source of truth for application deployments.

Instead of applying Kubernetes manifests manually, changes are committed to the repository and automatically synchronized to the Kubernetes cluster by Argo CD.

This approach provides:

- Declarative deployments
- Automated synchronization
- Self-healing
- Version-controlled infrastructure
- Improved deployment consistency

---

# 📂 Directory Purpose

This directory stores the Kubernetes application definitions required by Argo CD.

Typical contents include:

```text
argocd/
│
├── README.md
├── application.yaml
└── project.yaml
```

Depending on future project requirements, additional applications and environment-specific configurations can also be added.

---

# ⚙️ Deployment Workflow

The deployment lifecycle follows the GitOps model.

```text
Developer
      │
      ▼
Push Code
      │
      ▼
GitHub Repository
      │
      ▼
GitHub Actions
      │
      ▼
Container Image
      │
      ▼
Amazon ECR
      │
      ▼
Update Helm Values
      │
      ▼
Argo CD Detects Changes
      │
      ▼
Synchronize Cluster
      │
      ▼
Amazon EKS
```

---

# 🔄 Synchronization

Argo CD continuously compares:

- Desired state stored in Git
- Actual state running inside Kubernetes

Whenever differences are detected, Argo CD reconciles the cluster according to the configured synchronization policy.

---

# 🛡️ Self-Healing

If resources are accidentally modified or deleted within the cluster, Argo CD can automatically restore them to the desired configuration stored in Git.

This minimizes configuration drift and improves operational reliability.

---

# 🧹 Automatic Pruning

When enabled, Argo CD removes Kubernetes resources that no longer exist in the Git repository.

This keeps the cluster aligned with the latest declarative configuration and prevents orphaned resources.

---

# 📦 Deployment Components

OpsBoard integrates Argo CD with several platform components:

| Component | Purpose |
|-----------|---------|
| GitHub | Source of truth |
| GitHub Actions | Continuous Integration |
| Amazon ECR | Container image registry |
| Helm | Kubernetes package management |
| Amazon EKS | Kubernetes cluster |
| Argo CD | Continuous Delivery |

---

# 📁 Related Resources

Additional deployment resources are available in:

- `helm/`
- `infrastructure/`
- `docs/GITOPS.md`
- `docs/DEPLOYMENT.md`

---

# 🔮 Future Improvements

Potential future enhancements include:

- Multi-environment deployments
- Progressive delivery
- Blue/Green deployments
- Canary deployments
- ApplicationSets
- Multi-cluster synchronization

---

# 📌 Summary

Argo CD provides the Continuous Delivery component of the OpsBoard platform by implementing GitOps principles.

Using Git as the source of truth ensures deployments remain predictable, repeatable, and automatically synchronized with the Kubernetes cluster.
