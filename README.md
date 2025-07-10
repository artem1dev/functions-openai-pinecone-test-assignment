## Prerequisites

* Node.js ^18.x and npm
* Docker Compose
* PowerShell (for Windows scripts)
* For Linux: bash, AWS CLI, zip, curl

## Installation

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

## Environment Configuration

### `.env` File

1. Copy the template:

   ```bash
   cp .env.example .env
   ```
2. Edit `.env` to set your variables.

### AWS Lambda Config (`env.json`)

1. Copy JSON template:

   ```powershell
   Copy-Item .\scripts\env.example.json .\scripts\env.json
   ```
2. Open and configure `scripts/env.json` with your AWS settings.

---

## Running Locally

### Backend

```bash
cd backend
npm run start:dev
```

* The API will be available at `http://localhost:3001` by default.

### Frontend

```bash
cd frontend
npm run dev
```

* The client app will run at `http://localhost:3000` (or as defined in `.env`).

---

## Docker Compose (Backend)

To build and start the container in detached mode:

```bash
docker-compose up -d
```

---

## AWS Lambda Deployment Scripts

All deployment scripts are in `backend/scripts`.

### Windows (PowerShell)

```powershell
.\scripts\env-setup.ps1

.\scripts\build-lambdas.ps1

.\scripts\package-deploy-lambdas.ps1
```

### Linux (bash)

```bash
./scripts/env-setup.sh

./scripts/build-lambdas.sh

./scripts/package-deploy-lambdas.sh
```

### ExtractText config

You need to delete old zip file, and create new one with this files and folders:
- node_modules
- test
- index.js
- package-lock.json
- package.json

And than run this commands (from backend root folder):

```
aws --endpoint-url http://localhost:4566 lambda delete-function --function-name ExtractText
```

Windows (PowerShell)
```powershell
aws --endpoint-url http://localhost:4566 lambda create-function `
  --function-name ExtractText `
  --runtime nodejs18.x `
  --handler index.handler `
  --role arn:aws:iam::000000000000:role/DummyRole `
  --zip-file fileb://lambdas/ExtractText/ExtractText.zip `
  --environment file://./scripts/env.json
```

Linux (bash)
```bash
aws --endpoint-url http://localhost:4566 lambda create-function \
  --function-name ExtractText \
  --runtime "nodejs18.x" \
  --handler "index.handler" \
  --role "arn:aws:iam::000000000000:role/DummyRole" \
  --zip-file "fileb://lambdas/ExtractText/ExtractText.zip" \
  --environment "file://./scripts/env.json"
```