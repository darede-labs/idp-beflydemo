# idp-beflydemo

Demonstration For Be-Fly

## Architecture

- Frontend static: S3 + CloudFront
- Backend API: EKS (`/api/*`)
- Database: Aurora PostgreSQL
- Edge/API: API Gateway HTTP API + JWT authorizer
- GitOps: ArgoCD App-of-Apps

## Security — Change Database Password

> **⚠️ IMPORTANT: The database master password is committed as plain text in `infra/aurora-master-password-secret.yaml`.**
>
> All members of this repository can see the password. Change it immediately after provisioning:
>
> ```bash
> # Generate a strong password
> NEW_PASS=$(openssl rand -base64 24)
> echo "New password: $NEW_PASS"
>
> # Update the secret in Kubernetes
> kubectl patch secret beflydemo-aurora-master-password \
>   -n beflydemo \
>   --type=json \
>   -p "[{\"op\":\"replace\",\"path\":\"/data/password\",\"value\":\"$(echo -n $NEW_PASS | base64)\"}]"
>
> # Update the Secret in the repo (remove plain text value after changing)
> ```

## First Run Timeline

> **The backend starts with `replicas: 0` to avoid ImagePullBackOff before the first CI build.**

| Time | What happens |
|------|-------------|
| 0–2 min | ArgoCD creates namespace, Crossplane claims, Deployment (0 replicas) |
| 2–20 min | Aurora provisions (Crossplane). App shows `Progressing` — this is expected. |
| 20 min | Make your first backend push to trigger CI |
| 20–25 min | CI builds image, pushes to ECR, updates `infra/deployment.yaml` with real tag + replicas |
| 25 min | ArgoCD syncs → pod starts → app is live |

**Action required:** Push any change to `backend/` to trigger the first CI build and activate the deployment.

> ⚠️ **DO NOT delete `-infra` or `-backend` apps in ArgoCD without backing up the database first. Crossplane claims destroy AWS resources when deleted.**

## Paths

- `frontend/`: static web app
- `backend/`: nodejs api
- `infra/`: crossplane claims + kubernetes manifests + argocd apps
- `.github/workflows/`: backend and frontend CI pipelines
