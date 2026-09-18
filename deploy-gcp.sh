#!/bin/bash

# GCP Cloud Run 배포 스크립트

echo "🚀 GCP Cloud Run 배포 시작..."

# 1. JAR 파일 빌드
echo "📦 JAR 파일 빌드 중..."
./build.sh

# 2. Docker 이미지 빌드
echo "🐳 Docker 이미지 빌드 중..."
docker build -t gcr.io/YOUR_PROJECT_ID/rodos2 .

# 3. GCP에 이미지 푸시
echo "📤 GCP에 이미지 푸시 중..."
docker push gcr.io/YOUR_PROJECT_ID/rodos2

# 4. Cloud Run에 배포
echo "🚀 Cloud Run에 배포 중..."
gcloud run deploy rodos2 \
  --image gcr.io/YOUR_PROJECT_ID/rodos2 \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --port 8080

echo "✅ 배포 완료!"
echo "🌐 서비스 URL: https://rodos2-xxxxx-uc.a.run.app"
