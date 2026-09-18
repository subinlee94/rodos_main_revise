#!/bin/bash

# Heroku 배포 스크립트

echo "🚀 Heroku 배포 시작..."

# 1. JAR 파일 빌드
echo "📦 JAR 파일 빌드 중..."
./build.sh

# 2. Heroku 앱 생성 (처음만)
echo "📱 Heroku 앱 생성 중..."
heroku create rodos2-app

# 3. Heroku에 배포
echo "🚀 Heroku에 배포 중..."
git add .
git commit -m "Deploy RODOS2"
git push heroku main

echo "✅ 배포 완료!"
echo "🌐 서비스 URL: https://rodos2-app.herokuapp.com"
