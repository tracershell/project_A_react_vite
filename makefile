NODE_CONTAINER=apple2ne1-node
MYSQL_CONTAINER=apple2ne1-mysql
REDIS_CONTAINER=apple2ne1-redis
NGINX_CONTAINER=apple2ne1-nginx

# 개발 서버 실행
up:
	docker compose up --build

up-d:
	docker compose up -d

# 운영 서버 실행
up-prod:
	docker compose -f docker compose.yml -f docker compose.prod.yml up --build -d

# 정지 및 삭제
down:
	docker compose down

# 운영 이미지 빌드
build-prod:
	docker compose -f docker compose.yml -f docker compose.prod.yml build

# 실시간 로그 보기
logs:
	docker compose logs -f

# 컨테이너 접속
bash-node:
	docker exec -it $(NODE_CONTAINER) sh

bash-mysql:
	docker exec -it $(MYSQL_CONTAINER) bash

bash-redis:
	docker exec -it $(REDIS_CONTAINER) sh

bash-nginx:
	docker exec -it $(NGINX_CONTAINER) sh

# 컨테이너 상태
ps:
	docker compose ps

status:
	@echo "====== Docker 컨테이너 상태 ======"
	@docker ps --filter "name=apple2ne1" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# 재시작
restart:
	docker compose restart

# 전체 다시 빌드 및 실행
rebuild:
	docker compose down
	docker compose build
	docker compose up -d

# 이미지/볼륨 정리
prune:
	docker system prune -f
