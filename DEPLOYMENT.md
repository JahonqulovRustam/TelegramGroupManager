# Deployment Guide

## Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local builds)
- Git with LFS (for large files, if any)
- Azure/AWS/GCP CLI (if deploying to cloud)

## Local Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local and add your GEMINI_API_KEY

# Run dev server
npm run dev
# App will be available at http://localhost:5173/

# Type check
npx tsc --noEmit

# Build for production
npm run build
```

## Docker Build & Run

```bash
# Build image
docker build -t telegram-group-crm:latest .

# Run container
docker run -d \
  --name telegram-group-crm \
  -p 3000:3000 \
  -e GEMINI_API_KEY=your_key \
  telegram-group-crm:latest

# Check logs
docker logs -f telegram-group-crm

# Stop container
docker stop telegram-group-crm
docker rm telegram-group-crm
```

## Deployment via Script

```bash
# Make script executable (Linux/macOS)
chmod +x deploy.sh

# Deploy (builds Docker image, runs health checks, auto-rollback on failure)
./deploy.sh
```

## CI/CD Pipeline (GitHub Actions)

The `.github/workflows/build-deploy.yml` pipeline automatically:

1. **On PR to main**: Runs `tsc`, `npm run build`, `npm audit`
2. **On push to main**: Builds Docker image and performs health checks

View workflow status: GitHub  Actions tab

## Secrets Management

### Never commit:
- `.env.local`
- API keys
- Database credentials

### Store in:
- **Docker Secrets** (Docker Swarm)
- **Kubernetes Secrets** (K8s)
- **Environment Variables** (cloud provider)
- **GitHub Secrets** (CI/CD)

Example (GitHub Actions):
```yaml
- name: Deploy
  env:
    GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
  run: docker run -e GEMINI_API_KEY=$GEMINI_API_KEY telegram-group-crm:latest
```

## Health Checks

Container has built-in health check:
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1
```

Check container health:
```bash
docker ps --filter "name=telegram-group-crm"
# STATUS column should show "healthy"
```

## Rollback

### If health check fails:
1. `deploy.sh` automatically stops the failed container
2. Previous deployment is backed up in `./backups/previous/`
3. Manual restore: rebuild from Git tag or push previous Docker image

### Manual rollback:
```bash
# Stop current container
docker stop telegram-group-crm

# Re-run previous image (if you tagged it)
docker run -d --name telegram-group-crm -p 3000:3000 telegram-group-crm:previous
```

## Monitoring & Logs

### Docker logs:
```bash
docker logs -f telegram-group-crm
```

### Application errors:
Check the app's UI for error messages (especially in the browser console).

### Metrics to monitor:
- Container restart count
- Memory usage
- CPU usage
- Response time

## Production Checklist

- [ ] `.env.local` / secrets set in deployment environment (not in repo)
- [ ] `npm audit` shows no critical vulnerabilities
- [ ] `npm run build` succeeds
- [ ] Docker image builds and health check passes
- [ ] Database backups are created before deployment
- [ ] Monitoring/alerts are configured
- [ ] Rollback procedure is tested
- [ ] Team is notified of the deployment

## Troubleshooting

### Container exits immediately:
```bash
docker logs telegram-group-crm
# Check for missing GEMINI_API_KEY or other env vars
```

### Port 3000 already in use:
```bash
# Use a different port
docker run -p 8000:3000 telegram-group-crm:latest
```

### Health check fails:
```bash
# Access the app manually
curl http://localhost:3000

# Check container is running
docker ps

# Check logs
docker logs telegram-group-crm
```

## Support

For issues:
1. Check logs: `docker logs telegram-group-crm`
2. Verify environment: `docker inspect telegram-group-crm` (search "Env")
3. Test locally: `npm run dev` and check errors in browser console
