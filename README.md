# Production-Grade CI/CD Pipeline with EKS and Helm

A fully automated CI/CD pipeline built on AWS. When a developer pushes code to GitHub, Jenkins automatically builds, tests, and deploys the application to Kubernetes - with zero downtime.

---

## What This Project Does

- Automatically deploys code changes without any manual steps
- Runs tests before every deployment
- Scales the application up and down based on traffic
- Monitors everything with live dashboards
- Rolls back automatically if a deployment fails

---

## Tools and Technologies Used

### Cloud and Infrastructure
| Tool | Purpose |
|---|---|
| AWS | Cloud provider where everything runs |
| VPC | Private network to isolate all resources securely |
| EC2 | Virtual server that runs Jenkins |
| EKS | Managed Kubernetes cluster that runs the application |
| ECR | Private storage for Docker images |
| ALB | Load balancer that receives user traffic |
| NAT Gateway | Lets private servers access internet without being exposed |
| IAM | Controls which services can access what |

### CI/CD and Version Control
| Tool | Purpose |
|---|---|
| GitHub | Stores the source code |
| Jenkins | Automates build, test, and deploy on every code push |
| Jenkinsfile | Defines all 7 pipeline stages as code |
| SSH Key | Secure authentication between Jenkins and GitHub |

### Containers
| Tool | Purpose |
|---|---|
| Docker | Packages the application into a container image |
| Dockerfile | Recipe that defines how to build the image |
| Amazon ECR | Stores and versions every Docker image built |

### Kubernetes
| Tool | Purpose |
|---|---|
| EKS | Managed Kubernetes - AWS handles the control plane |
| eksctl | Command line tool to create the EKS cluster |
| kubectl | Command line tool to manage pods and deployments |
| Helm | Package manager for Kubernetes - handles deployments and rollbacks |
| Deployment | Runs 2 copies of the app, updates with zero downtime |
| Service | Routes traffic to the running pods |
| HPA | Auto-scales pods from 2 to 10 based on CPU usage |
| ConfigMap | Stores environment variables for the app |

### Application
| Tool | Purpose |
|---|---|
| Node.js | Runtime for the application |
| app.js | The actual web server that handles requests |
| package.json | Defines dependencies and test scripts |

### Monitoring
| Tool | Purpose |
|---|---|
| Prometheus | Collects metrics from every pod and node every 30 seconds |
| Grafana | Displays live dashboards for CPU, memory, and pod health |
| Alertmanager | Sends alerts when thresholds are crossed |
| Node Exporter | Collects hardware metrics from EC2 worker nodes |
| CloudWatch | AWS native monitoring for EC2 and EKS |

---

## Project Structure

```
cicd-eks-project/
├── app.js              # Node.js web server
├── Dockerfile          # Docker image definition
├── package.json        # App dependencies and test scripts
├── Jenkinsfile         # CI/CD pipeline (7 automated stages)
└── helm-chart/         # Kubernetes deployment configuration
    ├── Chart.yaml      # Chart name and version
    ├── values.yaml     # Image, replicas, ports, scaling config
    └── templates/
        ├── deployment.yaml   # How pods run
        ├── service.yaml      # How traffic reaches pods
        └── hpa.yaml          # Auto-scaling rules
```

---

## How the Pipeline Works

Every time code is pushed to GitHub, Jenkins runs these 7 stages automatically:

```
Stage 1 - Checkout      Pull the latest code from GitHub
Stage 2 - Build         Build a Docker image tagged with the build number
Stage 3 - Test          Run unit tests inside the container
Stage 4 - Push          Push the image to Amazon ECR
Stage 5 - Kubeconfig    Authenticate with the EKS cluster
Stage 6 - Deploy        Run helm upgrade to deploy the new image to Kubernetes
Stage 7 - Verify        Check that all pods are healthy before marking success
```

> If any stage fails, Jenkins automatically rolls back to the previous version.

---

## Infrastructure Setup

### VPC Layout

```
VPC - 10.0.0.0/16 (ap-south-1)
├── Public Subnet 1  (ap-south-1a) - Jenkins EC2, ALB
├── Public Subnet 2  (ap-south-1b) - ALB (multi-AZ)
├── Private Subnet 1 (ap-south-1a) - EKS Node 1
└── Private Subnet 2 (ap-south-1b) - EKS Node 2
```

### EKS Cluster
- Kubernetes version: 1.35
- Worker nodes: 2x t3.medium
- Node location: private subnets
- Auto-scaling: 1 to 4 nodes

### Jenkins Server
- Instance: EC2 t3.medium
- Location: public subnet
- Port: 8080
- Tools installed: Java 21, Jenkins, Docker, kubectl, Helm, AWS CLI, eksctl

---

## How Zero Downtime Deployment Works

When a new version is deployed, Kubernetes performs a rolling update:

```
Step 1 - New pods start with the new version
Step 2 - Health checks run on the new pods
Step 3 - Once healthy, old pods are removed
Step 4 - No downtime at any point
```

To roll back manually:
```bash
helm rollback my-app 1
```

---

## Monitoring

Prometheus and Grafana are installed on the cluster using Helm.

**Grafana dashboards include:**
- Kubernetes cluster CPU and memory overview
- Per-pod resource usage
- Node Exporter - EC2 worker node metrics
- HPA status - how many pods are running

**Access Grafana:**
```bash
kubectl port-forward svc/monitoring-grafana 3000:80 -n monitoring --address 0.0.0.0 &
```
Open `http://<EC2-IP>:3000` and log in with `admin / Admin@123`

---

## Key Commands

```bash
# Check running pods
kubectl get pods

# Check the load balancer URL
kubectl get svc my-app

# Check auto-scaler status
kubectl get hpa

# View deployment history
helm history my-app

# Roll back to previous version
helm rollback my-app 1

# Check node resource usage
kubectl top nodes

# Check pod resource usage
kubectl top pods
```

---

## Results

| Metric | Result |
|---|---|
| Deployment time | Reduced by 70% |
| Downtime during deploy | Zero |
| Pod auto-scaling | 2 to 10 pods based on CPU |
| Pipeline stages | 7 fully automated |
| Monitoring | Full cluster and application coverage |

---

  

