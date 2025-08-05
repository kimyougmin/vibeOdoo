#!/bin/bash

echo "🚀 Odoo HR 백엔드 시작 중..."

# Docker Compose로 Odoo 실행
echo "📦 Docker 컨테이너 시작..."
docker-compose up -d

echo "⏳ Odoo 서비스 시작 대기 중..."
sleep 30

echo "✅ Odoo 백엔드가 성공적으로 시작되었습니다!"
echo "🌐 브라우저에서 http://localhost:8069 접속하여 Odoo 설정을 완료하세요."
echo ""
echo "📋 설정 단계:"
echo "1. 데이터베이스 생성"
echo "2. 관리자 계정 설정"
echo "3. HR 모듈 설치"
echo "4. API 접근을 위한 API 키 생성"
echo ""
echo "🔧 컨테이너 상태 확인:"
docker-compose ps 