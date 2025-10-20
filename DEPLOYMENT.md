# Deployment Guide - AI Summarization Proxy API

## Overview

This guide covers deployment options for the AI Summarization Proxy API.

## Prerequisites

- Node.js 22.x or later
- Hugging Face API token
- Git (for cloning repository)

## Deployment Options

### 1. AWS Lambda + API Gateway (Recommended for Serverless)

#### Benefits
- Auto-scaling
- Pay-per-use pricing
- No server management
- Built-in monitoring

#### Steps

1. **Install AWS SAM CLI**
   ```bash
   # Windows (with Chocolatey)
   choco install aws-sam-cli
   
   # macOS
   brew install aws-sam-cli
   ```

2. **Build the Project**
   ```bash
   npm run build
   ```

3. **Create SAM Template** (`template.yaml`):
   ```yaml
   AWSTemplateFormatVersion: '2010-09-09'
   Transform: AWS::Serverless-2016-10-31
   
   Globals:
     Function:
       Timeout: 30
       MemorySize: 512
       Runtime: nodejs22.x
   
   Resources:
     SummarizeApiFunction:
       Type: AWS::Serverless::Function
       Properties:
         CodeUri: ./
         Handler: dist/lambda.handler
         Environment:
           Variables:
             HUGGINGFACE_API_TOKEN: !Ref HuggingFaceToken
             HUGGINGFACE_MODEL: facebook/bart-large-cnn
             NODE_ENV: production
         Events:
           Summarize:
             Type: Api
             Properties:
               Path: /api/summarize
               Method: post
           Health:
             Type: Api
             Properties:
               Path: /health
               Method: get
   
   Parameters:
     HuggingFaceToken:
       Type: String
       NoEcho: true
       Description: Hugging Face API Token
   ```

4. **Create Lambda Handler** (`src/lambda.ts`):
   ```typescript
   import serverlessExpress from '@codegenie/serverless-express';
   import app from './index';
   
   export const handler = serverlessExpress({ app });
   ```

5. **Deploy**
   ```bash
   sam build
   sam deploy --guided
   ```

6. **Configure API Gateway**
   - Set rate limiting in API Gateway console
   - Configure CORS if needed
   - Set up custom domain

### 2. Traditional Server Deployment

#### VPS/EC2

1. **SSH into server**
   ```bash
   ssh user@your-server.com
   ```

2. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Clone Repository**
   ```bash
   git clone https://github.com/pinikaminer8/summarize-api.git
   cd summarize-api
   ```

4. **Install Dependencies**
   ```bash
   npm install
   ```

5. **Configure Environment**
   ```bash
   cp .env.example .env
   nano .env  # Edit with your settings
   ```

6. **Build**
   ```bash
   npm run build
   ```

7. **Install PM2**
   ```bash
   npm install -g pm2
   ```

8. **Start with PM2**
   ```bash
   pm2 start dist/index.js --name summarize-api
   pm2 save
   pm2 startup
   ```

9. **Setup Nginx Reverse Proxy** (Optional)
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

10. **Setup SSL with Let's Encrypt**
    ```bash
    sudo certbot --nginx -d api.yourdomain.com
    ```

### 3. Docker Deployment

#### Local Docker

```bash
# Build image
docker build -t summarize-api .

# Run container
docker run -d \
  --name summarize-api \
  -p 3000:3000 \
  --env-file .env \
  -v $(pwd)/logs:/app/logs \
  summarize-api
```

#### Docker Compose

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Docker Hub

1. **Tag Image**
   ```bash
   docker tag summarize-api your-username/summarize-api:latest
   ```

2. **Push to Docker Hub**
   ```bash
   docker login
   docker push your-username/summarize-api:latest
   ```

3. **Pull and Run on Server**
   ```bash
   docker pull your-username/summarize-api:latest
   docker run -d -p 3000:3000 --env-file .env your-username/summarize-api:latest
   ```

### 4. Platform as a Service (PaaS)

#### Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Create `vercel.json`**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "dist/index.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "dist/index.js"
       }
     ],
     "env": {
       "NODE_ENV": "production"
     }
   }
   ```

3. **Deploy**
   ```bash
   npm run build
   vercel --prod
   ```

#### Railway

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Deploy**
   ```bash
   railway login
   railway init
   railway up
   ```

3. **Set Environment Variables**
   ```bash
   railway variables set HUGGINGFACE_API_TOKEN=your_token
   railway variables set NODE_ENV=production
   ```

#### Render

1. Create account at render.com
2. Connect GitHub repository
3. Configure build settings:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. Add environment variables in dashboard
5. Deploy

## Environment Variables

Ensure these are set in your deployment:

```env
NODE_ENV=production
PORT=3000
HUGGINGFACE_API_TOKEN=your_token_here
HUGGINGFACE_MODEL=facebook/bart-large-cnn
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
REQUEST_TIMEOUT_MS=5000
```

## Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure `HUGGINGFACE_API_TOKEN`
- [ ] Set appropriate `CORS_ORIGIN`
- [ ] Configure rate limiting
- [ ] Set up SSL/HTTPS
- [ ] Enable logging
- [ ] Set up monitoring (CloudWatch, Datadog, etc.)
- [ ] Configure auto-restart (PM2, systemd, etc.)
- [ ] Set up backups for logs
- [ ] Configure firewall rules
- [ ] Test error scenarios
- [ ] Load testing
- [ ] Set up alerts for errors

## Monitoring

### PM2 Monitoring

```bash
# View logs
pm2 logs summarize-api

# Monitor resources
pm2 monit

# View status
pm2 status
```

### Docker Monitoring

```bash
# View logs
docker logs -f summarize-api

# View stats
docker stats summarize-api
```

### CloudWatch (AWS)

- Enable CloudWatch Logs for Lambda
- Set up alarms for errors and timeouts
- Create dashboards for metrics

## Scaling

### Horizontal Scaling

**AWS:**
- Configure Auto Scaling for Lambda
- Use Application Load Balancer

**Docker:**
- Use Docker Swarm or Kubernetes
- Configure replicas in docker-compose

### Vertical Scaling

- Increase memory/CPU allocation
- Optimize Hugging Face model selection
- Implement caching layer

## Rollback Strategy

### PM2
```bash
pm2 stop summarize-api
git checkout previous-version
npm install
npm run build
pm2 restart summarize-api
```

### Docker
```bash
docker stop summarize-api
docker run -d \
  --name summarize-api \
  -p 3000:3000 \
  --env-file .env \
  your-username/summarize-api:previous-tag
```

### AWS Lambda
```bash
sam deploy --parameter-overrides Version=previous-version
```

## Troubleshooting

### Server Won't Start
1. Check environment variables
2. Verify Hugging Face token
3. Check port availability
4. Review logs

### High Latency
1. Monitor Hugging Face API response times
2. Check network latency
3. Consider caching
4. Optimize model selection

### Out of Memory
1. Increase memory allocation
2. Monitor memory usage
3. Check for memory leaks
4. Optimize request handling

## Security Best Practices

1. **Never commit `.env` file**
2. **Use environment-specific configurations**
3. **Enable rate limiting**
4. **Use HTTPS in production**
5. **Implement API key authentication** (future)
6. **Regular security updates**
7. **Monitor for suspicious activity**

## Cost Optimization

### AWS Lambda
- Use provisioned concurrency wisely
- Optimize timeout settings
- Consider reserved capacity for predictable load

### Traditional Servers
- Right-size instance type
- Use auto-scaling
- Implement caching
- Monitor and optimize resource usage

## Support

For deployment issues:
- Check logs in `logs/` directory
- Review error messages
- Consult documentation
- Open GitHub issue

---

**Last Updated:** October 2025  
**Author:** Pini
