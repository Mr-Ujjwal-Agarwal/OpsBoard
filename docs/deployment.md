# 🚀 Deployment Guide

> Comprehensive deployment documentation for the OpsBoard Cloud-Native DevOps Platform.

---

# 📖 Table of Contents

- Introduction
- Deployment Strategy
- Deployment Architecture
- Prerequisites
- Environment Preparation
- Local Deployment
- AWS Infrastructure Deployment
- Kubernetes Cluster Deployment
- Helm Deployment
- GitOps Deployment
- Verification
- Rollback
- Troubleshooting
- Cleanup

---

# 📖 Introduction

This document describes the complete deployment lifecycle of **OpsBoard**, from local development to a fully automated production-inspired deployment on Amazon Elastic Kubernetes Service (EKS).

The deployment process has been designed around modern DevOps principles including:

- Infrastructure as Code
- Immutable Containers
- Continuous Integration
- GitOps
- Declarative Kubernetes
- Automated Rollouts
- Observability

Rather than relying on manual server configuration or imperative deployment commands, OpsBoard follows a reproducible deployment workflow where infrastructure, application configuration, and Kubernetes resources are version-controlled.

---

# 🎯 Deployment Objectives

The deployment process is designed to achieve the following objectives:

- Repeatable infrastructure provisioning
- Automated application deployment
- Environment consistency
- Version-controlled releases
- Minimal manual intervention
- Reliable rollback capability
- Production-inspired operational practices

---

# 🏗️ Deployment Strategy

OpsBoard separates deployment into independent engineering stages.

Each stage has a clearly defined responsibility and can be executed repeatedly without affecting the integrity of the platform.

```text
Infrastructure
        │
        ▼
Terraform
        │
        ▼
AWS Resources
        │
        ▼
Amazon EKS
        │
        ▼
Docker Images
        │
        ▼
Amazon ECR
        │
        ▼
Helm
        │
        ▼
Argo CD
        │
        ▼
Running Platform
```

This layered deployment model improves maintainability, scalability, and operational consistency.

---

# ☁️ Deployment Architecture

The following diagram illustrates the relationship between the deployment components.

```text
Developer
      │
      ▼
GitHub Repository
      │
      ▼
GitHub Actions
      │
      ▼
Docker Build
      │
      ▼
Amazon ECR
      │
      ▼
Helm Release
      │
      ▼
Argo CD
      │
      ▼
Amazon EKS
      │
      ▼
Frontend
Backend
Database
```

Each deployment layer performs one responsibility before handing control to the next layer.

---

# 📋 Prerequisites

Before deploying OpsBoard, ensure the following software is installed.

| Software | Recommended Version |
|-----------|---------------------|
| Git | Latest |
| Docker | 24+ |
| Docker Compose | Latest |
| Terraform | 1.6+ |
| kubectl | Latest |
| Helm | 3.x |
| AWS CLI | Version 2 |
| eksctl | Latest |
| Node.js | 20+ |

---

# 🔐 AWS Requirements

An AWS account with permissions to manage:

- Amazon VPC
- IAM
- Amazon EKS
- Amazon ECR
- EC2
- CloudWatch
- Load Balancers

Recommended IAM permissions include:

- AmazonEKSClusterPolicy
- AmazonEC2FullAccess
- AmazonEC2ContainerRegistryFullAccess
- IAMFullAccess
- AmazonVPCFullAccess

---

# 🌍 Environment Preparation

Clone the repository.

```bash
git clone https://github.com/YOUR_USERNAME/OpsBoard.git

cd OpsBoard
```

---

Verify Docker.

```bash
docker --version
```

---

Verify Terraform.

```bash
terraform version
```

---

Verify Kubernetes CLI.

```bash
kubectl version --client
```

---

Verify Helm.

```bash
helm version
```

---

Verify AWS CLI.

```bash
aws --version
```

---

Verify AWS authentication.

```bash
aws configure
```

Confirm identity.

```bash
aws sts get-caller-identity
```

---

# 💻 Local Deployment

Before provisioning cloud infrastructure, the application should be validated locally.

This ensures that application services communicate correctly before being deployed to Kubernetes.

---

## Step 1 — Build Containers

```bash
docker compose build
```

---

## Step 2 — Start Services

```bash
docker compose up -d
```

---

## Step 3 — Verify Containers

```bash
docker ps
```

Expected services include:

- Frontend
- Backend
- PostgreSQL

---

## Step 4 — Validate Application

Open the application in your browser.

```text
http://localhost:3000
```

Verify that:

- Frontend loads successfully
- Backend API responds
- Database connection is healthy

---

# ☁️ AWS Infrastructure Deployment

Infrastructure provisioning is handled entirely through Terraform.

All AWS resources are defined declaratively and stored within version control.

Navigate to the Terraform directory.

```bash
cd infrastructure/terraform
```

---

Initialize Terraform.

```bash
terraform init
```

---

Review execution plan.

```bash
terraform plan
```

---

Provision infrastructure.

```bash
terraform apply
```

Terraform creates resources including:

- VPC
- Public Subnets
- Private Subnets
- Internet Gateway
- Route Tables
- IAM Roles
- Amazon EKS Cluster
- Security Groups
- Container Registry (ECR)

---

## Verify Infrastructure

```bash
terraform show
```

List outputs.

```bash
terraform output
```

---

# 📌 Deployment Summary

At this stage the following components should be available:

| Component | Status |
|-----------|--------|
| AWS Infrastructure | ✅ |
| Networking | ✅ |
| IAM | ✅ |
| Amazon ECR | ✅ |
| Amazon EKS | ✅ |
| Terraform State | ✅ |

---

# ☸️ Kubernetes Cluster Configuration

After the infrastructure has been provisioned successfully, the next step is configuring local access to the Amazon Elastic Kubernetes Service (EKS) cluster.

Terraform provisions the cluster, but `kubectl` requires a valid kubeconfig file before it can communicate with the Kubernetes API Server.

---

## Update kubeconfig

Replace the placeholders below with your AWS Region and EKS Cluster name.

```bash
aws eks update-kubeconfig \
    --region <AWS_REGION> \
    --name <EKS_CLUSTER_NAME>
```

---

## Verify Current Context

```bash
kubectl config current-context
```

Expected output:

```text
arn:aws:eks:<region>:<account-id>:cluster/<cluster-name>
```

---

## Verify Cluster Connectivity

```bash
kubectl cluster-info
```

Expected result:

- Kubernetes API Server reachable
- CoreDNS running
- Cluster endpoints accessible

---

## Verify Worker Nodes

```bash
kubectl get nodes
```

Example

```text
NAME                     STATUS   ROLES    AGE     VERSION
ip-10-0-1-24             Ready    <none>   12m     v1.30
ip-10-0-2-45             Ready    <none>   12m     v1.30
```

All worker nodes should report the **Ready** status.

---

# 🐳 Container Image Deployment

Once the Kubernetes cluster is available, application containers must be built and published to Amazon Elastic Container Registry (ECR).

OpsBoard uses immutable container images to ensure deployment consistency across every environment.

---

## Build Frontend Image

```bash
docker build \
-t opsboard/frontend:latest \
./app/frontend
```

---

## Build Backend Image

```bash
docker build \
-t opsboard/backend:latest \
./app/backend
```

---

## Authenticate Docker with Amazon ECR

```bash
aws ecr get-login-password \
| docker login \
--username AWS \
--password-stdin <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com
```

---

## Tag Images

Frontend

```bash
docker tag opsboard/frontend:latest \
<ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/opsboard/frontend:latest
```

Backend

```bash
docker tag opsboard/backend:latest \
<ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/opsboard/backend:latest
```

---

## Push Images

Frontend

```bash
docker push \
<ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/opsboard/frontend:latest
```

Backend

```bash
docker push \
<ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/opsboard/backend:latest
```

---

## Verify Images

Navigate to Amazon ECR and verify that the repositories contain the newly published container images.

Expected repositories:

```text
frontend

backend
```

---

# 📦 Helm Deployment

OpsBoard uses Helm to package Kubernetes resources into reusable and version-controlled releases.

Rather than applying multiple YAML manifests manually, Helm installs the complete application stack as a single release.

---

## Navigate to Helm Chart

```bash
cd helm/opsboard
```

---

## Validate Chart

```bash
helm lint .
```

The command validates chart syntax before installation.

---

## Review Templates

```bash
helm template opsboard .
```

This renders Kubernetes manifests locally without deploying them.

---

## Install Helm Release

```bash
helm install opsboard .
```

---

## Verify Release

```bash
helm list
```

Expected output

```text
NAME

opsboard
```

---

## Verify Kubernetes Resources

```bash
kubectl get all
```

Expected resources

- Deployments
- ReplicaSets
- Pods
- Services

---

# 🔄 GitOps Deployment

Helm installs the application, while Argo CD continuously synchronizes Kubernetes with Git.

Instead of deploying changes manually, engineers update Git, and Argo CD automatically reconciles the cluster.

This ensures that Git remains the single source of truth.

---

## GitOps Deployment Flow

```text
Developer

↓

Git Commit

↓

GitHub Repository

↓

Helm Values Updated

↓

Argo CD Detects Changes

↓

Cluster Synchronization

↓

Pods Updated
```

---

## Register Application

Example

```bash
argocd app create opsboard \
--repo https://github.com/<username>/OpsBoard.git \
--path helm/opsboard \
--dest-server https://kubernetes.default.svc \
--dest-namespace default
```

---

## Synchronize Application

```bash
argocd app sync opsboard
```

---

## Verify Synchronization

```bash
argocd app get opsboard
```

Expected Status

```text
Health

Healthy

Sync

Synced
```

---

# 🔍 Deployment Verification

Deployment should always be verified before exposing the platform to users.

---

## Verify Pods

```bash
kubectl get pods
```

Expected

```text
frontend

backend

postgres
```

All Pods should report

```text
Running
```

---

## Verify Deployments

```bash
kubectl get deployments
```

---

## Verify Services

```bash
kubectl get svc
```

---

## Verify Ingress

```bash
kubectl get ingress
```

---

## Describe Deployment

```bash
kubectl describe deployment frontend
```

Repeat for backend if required.

---

## View Application Logs

Frontend

```bash
kubectl logs deployment/frontend
```

Backend

```bash
kubectl logs deployment/backend
```

---

## Verify Database Connectivity

```bash
kubectl exec -it deployment/backend -- sh
```

Execute database health checks from within the container to confirm connectivity.

---

# ❤️ Health Checks

The following operational checks should succeed before considering the deployment production-ready.

| Check | Expected Status |
|---------|----------------|
| Terraform Apply | ✅ Successful |
| AWS Infrastructure | ✅ Available |
| Amazon EKS | ✅ Running |
| Worker Nodes | ✅ Ready |
| Docker Images | ✅ Published |
| Amazon ECR | ✅ Available |
| Helm Release | ✅ Deployed |
| Argo CD | ✅ Synced |
| Pods | ✅ Running |
| Services | ✅ Available |
| Ingress | ✅ Accessible |
| Database | ✅ Connected |
| Application | ✅ Reachable |
| Grafana | ✅ Running |
| Prometheus | ✅ Collecting Metrics |
| Loki | ✅ Receiving Logs |

---

# 📊 Post-Deployment Validation

After deployment, verify the complete platform by confirming that:

- Infrastructure was provisioned successfully.
- Worker nodes are healthy.
- Kubernetes Deployments are available.
- Pods have reached the Running state.
- Services expose the required workloads.
- Ingress routes external traffic correctly.
- Container images originate from Amazon ECR.
- Helm reports a successful release.
- Argo CD shows a Healthy and Synced application.
- Prometheus is scraping metrics.
- Grafana dashboards are accessible.
- Loki is receiving application logs.

At this point, OpsBoard should be fully deployed and operational on the Kubernetes cluster.

---

# 🔁 Rollback Strategy

Even with automated deployment pipelines, software releases may occasionally introduce regressions or unexpected behavior.

OpsBoard incorporates multiple rollback mechanisms across the infrastructure, application, and Kubernetes layers to minimize downtime and restore service quickly.

Each layer supports independent rollback, allowing engineers to recover from failures without rebuilding the entire platform.

---

# 🏗️ Infrastructure Rollback (Terraform)

Terraform maintains the desired state of infrastructure through its state file.

If infrastructure changes introduce issues, revert the Terraform configuration to the last known stable version and execute a new deployment.

Review planned changes:

```bash
terraform plan
```

Apply the previous configuration:

```bash
terraform apply
```

If infrastructure resources must be removed completely:

```bash
terraform destroy
```

> **Note:** Use `terraform destroy` only for non-production environments or when intentionally decommissioning infrastructure.

---

# 📦 Helm Rollback

Helm stores release history for every deployment.

List release history:

```bash
helm history opsboard
```

Example:

```text
REVISION    STATUS
1           deployed
2           superseded
3           deployed
```

Rollback to Revision 2:

```bash
helm rollback opsboard 2
```

Verify rollback:

```bash
helm status opsboard
```

---

# 🔄 GitOps Rollback

GitOps makes rollback straightforward because Git represents the desired state.

Rollback process:

1. Revert the commit introducing the issue.
2. Push the reverted commit.
3. Argo CD detects the change.
4. Kubernetes automatically synchronizes to the previous state.

```text
Problematic Commit

↓

Git Revert

↓

GitHub

↓

Argo CD

↓

Cluster Synchronization

↓

Previous Stable Release
```

No manual Kubernetes modifications are required.

---

# ☸️ Kubernetes Rollback

Kubernetes maintains Deployment revision history.

View rollout history:

```bash
kubectl rollout history deployment/frontend
```

Rollback:

```bash
kubectl rollout undo deployment/frontend
```

Rollback to a specific revision:

```bash
kubectl rollout undo deployment/frontend --to-revision=2
```

Verify rollout:

```bash
kubectl rollout status deployment/frontend
```

Repeat the process for additional workloads as required.

---

# 🚨 Failure Recovery

The following recovery procedures address common operational failures.

---

## Pod Failure

Symptoms

- Pod enters CrashLoopBackOff
- Pod restarts continuously
- Readiness probes fail

Recovery

```bash
kubectl describe pod <pod-name>
```

```bash
kubectl logs <pod-name>
```

If configuration is incorrect:

- Update configuration
- Commit changes
- Allow Argo CD to synchronize

---

## Image Pull Failure

Possible causes:

- Incorrect image tag
- Missing image
- Authentication failure

Verify:

```bash
kubectl describe pod <pod-name>
```

Look for:

```text
ImagePullBackOff
```

Correct the image reference and redeploy.

---

## Database Connectivity Failure

Verify database Pod:

```bash
kubectl get pods
```

Verify Service:

```bash
kubectl get svc
```

Test connectivity:

```bash
kubectl exec -it deployment/backend -- sh
```

Confirm:

- Database hostname
- Credentials
- Network connectivity
- Secrets configuration

---

## Argo CD Out of Sync

Check application:

```bash
argocd app get opsboard
```

Synchronize manually:

```bash
argocd app sync opsboard
```

---

## Worker Node Failure

Verify nodes:

```bash
kubectl get nodes
```

Inspect node:

```bash
kubectl describe node <node-name>
```

Kubernetes automatically reschedules workloads when healthy nodes are available.

---

# 🛠️ Troubleshooting Matrix

| Issue | Possible Cause | Resolution |
|------|----------------|-----------|
| Terraform failure | Invalid configuration | Review plan and fix configuration |
| Docker build fails | Dependency issue | Review Dockerfile and build logs |
| ECR push fails | Authentication problem | Login to ECR again |
| Pods Pending | Insufficient resources | Verify node capacity |
| CrashLoopBackOff | Application failure | Review logs |
| ImagePullBackOff | Missing container image | Verify image repository |
| Service unavailable | Service selector mismatch | Validate labels |
| Ingress inaccessible | Incorrect ingress configuration | Review ingress resource |
| Argo CD OutOfSync | Repository drift | Synchronize application |
| Grafana unavailable | Monitoring components not running | Verify monitoring namespace |

---

# 📊 Operational Best Practices

To improve deployment reliability, follow these operational recommendations.

## Infrastructure

- Keep Terraform state secure.
- Review every execution plan before applying.
- Use separate state files for different environments.
- Never modify cloud resources manually.

---

## Containers

- Build immutable images.
- Tag releases consistently.
- Remove unused images.
- Keep Dockerfiles minimal.

---

## Kubernetes

- Use declarative manifests.
- Define resource requests and limits.
- Configure readiness and liveness probes.
- Monitor rollout status after deployment.

---

## GitOps

- Never apply manifests manually in production.
- Manage deployments through Git.
- Review pull requests before merging.
- Keep Git history clean.

---

## Observability

Monitor continuously:

- Node health
- Pod health
- CPU utilization
- Memory utilization
- Network traffic
- Error rates
- Application logs

---

# 📋 Production Deployment Checklist

Before considering a deployment complete, verify every item below.

## Infrastructure

- [ ] Terraform completed successfully
- [ ] AWS resources provisioned
- [ ] VPC created
- [ ] Security Groups configured
- [ ] IAM roles attached
- [ ] Amazon EKS available

---

## Kubernetes

- [ ] Worker nodes Ready
- [ ] Deployments Available
- [ ] ReplicaSets Healthy
- [ ] Pods Running
- [ ] Services Created
- [ ] Ingress Accessible

---

## Application

- [ ] Frontend Reachable
- [ ] Backend API Healthy
- [ ] Database Connected
- [ ] Images Pulled Successfully

---

## GitOps

- [ ] Helm Release Installed
- [ ] Argo CD Healthy
- [ ] Application Synced

---

## Monitoring

- [ ] Prometheus Running
- [ ] Grafana Running
- [ ] Loki Running
- [ ] Dashboards Available
- [ ] Logs Collected

---

# 🧹 Cleanup

When the deployment environment is no longer required, resources should be removed to avoid unnecessary cloud costs.

---

## Remove Helm Release

```bash
helm uninstall opsboard
```

---

## Delete Kubernetes Resources

```bash
kubectl delete namespace opsboard
```

---

## Destroy Infrastructure

Navigate to the Terraform directory.

```bash
cd infrastructure/terraform
```

Destroy infrastructure.

```bash
terraform destroy
```

Terraform removes:

- VPC
- Subnets
- Internet Gateway
- Security Groups
- Amazon EKS
- IAM Resources
- Load Balancers

---

## Verify Cleanup

Confirm that no resources remain.

```bash
kubectl get all
```

```bash
aws eks list-clusters
```

```bash
aws ecr describe-repositories
```

---

# 📌 Deployment Summary

The OpsBoard deployment process demonstrates a modern cloud-native software delivery workflow.

The platform combines Infrastructure as Code, containerization, Kubernetes orchestration, GitOps, and observability into a repeatable deployment strategy suitable for production-inspired environments.

Deployment responsibilities are intentionally separated into independent engineering layers:

| Layer | Technology | Responsibility |
|--------|------------|----------------|
| Infrastructure | Terraform | Provision cloud resources |
| Containers | Docker | Package application services |
| Registry | Amazon ECR | Store immutable images |
| Orchestration | Amazon EKS | Run Kubernetes workloads |
| Packaging | Helm | Manage application releases |
| Continuous Delivery | Argo CD | Synchronize desired state |
| Monitoring | Prometheus | Collect operational metrics |
| Visualization | Grafana | Display infrastructure health |
| Logging | Loki | Centralize application logs |

Together, these components create an automated deployment platform that emphasizes repeatability, reliability, observability, and operational consistency.

---

# 🎯 Next Steps

After successfully deploying OpsBoard, continue with the following documentation:

- `LOCAL_SETUP.md`
- `CI-CD.md`
- `GITOPS.md`
- `INFRASTRUCTURE.md`
- `MONITORING.md`
- `SECURITY.md`
- `TROUBLESHOOTING.md`

These guides provide deeper insight into individual platform components and operational workflows.
