# Deployment

TransitOps deploys to AWS as:

- **Backend** — Express app on **AWS Lambda** behind an **API Gateway HTTP API**
  (Express is wrapped with `serverless-http`; see `backend/lambda.js`).
- **Frontend** — Vite/React build hosted in a private **S3** bucket, served by
  **CloudFront**.
- **One origin** — CloudFront serves the SPA and forwards `/api/*` to the API.
  Because the site and the API share an origin, there is **no CORS** and the
  auth cookie (`httpOnly`, `sameSite=lax`, `secure`) works as-is.

Both deploy automatically from `main` via **GitHub Actions**.

```
Browser ──▶ CloudFront ─┬─ default ▶ S3 (React SPA)
                        └─ /api/*  ▶ API Gateway ▶ Lambda (Express) ▶ MongoDB
```

Infrastructure is defined once in [`template.yaml`](template.yaml) (AWS SAM).

---

## 1. One-time prerequisites

### a. AWS IAM user for CI
Create an IAM user with programmatic access and permissions to deploy the stack
(CloudFormation, Lambda, API Gateway, S3, CloudFront, IAM role creation for the
function). `AdministratorAccess` is simplest to start; scope it down later.
Save the **Access key ID** and **Secret access key**.

### b. MongoDB
Have a MongoDB connection string ready (`MONGO_URI`). If using MongoDB Atlas,
allow access from anywhere (`0.0.0.0/0`) in **Network Access**, since Lambda
egress IPs are not fixed (this stack does not use a VPC/NAT).

### c. Pick a region
Choose one AWS region (e.g. `ap-south-1`) and use it for every secret/deploy.

---

## 2. GitHub repository secrets

**Settings ▸ Secrets and variables ▸ Actions ▸ New repository secret:**

| Secret | Required | Notes |
| --- | --- | --- |
| `AWS_ACCESS_KEY_ID` | ✅ | From step 1a |
| `AWS_SECRET_ACCESS_KEY` | ✅ | From step 1a |
| `AWS_REGION` | ✅ | e.g. `ap-south-1` |
| `MONGO_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Any long random string |
| `CLIENT_URL` | ⬜ | Public site URL for email links. Leave empty for the first deploy, then set to the CloudFront URL (see step 4). |
| `SMTP_HOST` | ⬜ | Only if email (nodemailer) is used |
| `SMTP_PORT` | ⬜ | Defaults to `587` |
| `SMTP_USER` | ⬜ | |
| `SMTP_PASS` | ⬜ | |
| `SMTP_FROM` | ⬜ | From address |

> Missing optional secrets simply pass through as empty strings.

---

## 3. First deploy (order matters once)

The frontend workflow reads the S3 bucket and CloudFront ID from the backend
stack's outputs, so **the backend must deploy first the very first time.**

1. **Backend** — trigger *Deploy Backend* (push a change under `backend/` or run
   it manually from the **Actions** tab → *Run workflow*). This creates the whole
   stack: Lambda, API Gateway, S3 bucket, CloudFront. It prints the stack outputs
   at the end (`CloudFrontURL`, `FrontendBucketName`, `DistributionId`, `ApiUrl`).
2. **Frontend** — trigger *Deploy Frontend*. It builds the SPA, syncs it to the
   bucket, and invalidates CloudFront.

After this, each push to `main` auto-deploys only what changed (path filters on
`backend/**` + `template.yaml` vs `frontend/**`). Both can be re-run manually via
**workflow_dispatch**.

---

## 4. Finish the email links (optional)

`CLIENT_URL` is used to build links in outgoing emails. On the first deploy it's
unknown, so:

1. Copy `CloudFrontURL` from the backend workflow output
   (e.g. `https://d123abc.cloudfront.net`).
2. Set the `CLIENT_URL` GitHub secret to it.
3. Re-run *Deploy Backend* so the Lambda picks up the new value.

Using a custom domain? Point it at the CloudFront distribution (add the domain as
an alternate name + an ACM cert in `us-east-1`), and set `CLIENT_URL` to it.

---

## 5. Local development (unchanged)

```bash
# backend
cd backend && npm install && npm run dev      # http://localhost:5000

# frontend (Vite dev server proxies /api -> :5000)
cd frontend && npm install && npm run dev      # http://localhost:5173
```

`backend/.env` still drives local config (`MONGO_URI`, `JWT_SECRET`, `PORT`,
`SMTP_*`, `CLIENT_URL`).

---

## 6. Deploying manually from your machine (optional)

```bash
sam build
sam deploy --guided \
  --stack-name transitops \
  --capabilities CAPABILITY_IAM \
  --resolve-s3 \
  --parameter-overrides MongoUri=... JwtSecret=... ClientUrl=...
```

## Teardown

```bash
# empty the bucket first, then:
aws cloudformation delete-stack --stack-name transitops --region <AWS_REGION>
```

---

## How the pieces map

| Concern | Where |
| --- | --- |
| Express → Lambda adapter | `backend/lambda.js` |
| Warm-connection Mongo pooling | `backend/config/db.js` |
| Local server entry | `backend/server.js` |
| All AWS resources | `template.yaml` |
| Backend CI/CD | `.github/workflows/backend-deploy.yml` |
| Frontend CI/CD | `.github/workflows/frontend-deploy.yml` |
