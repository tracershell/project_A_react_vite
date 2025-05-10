# ─────────────────────────────────────────────────────────────────────
# 컨테이너 이름 정의
NODE_CONTAINER   = apple2ne1-node
MYSQL_CONTAINER  = apple2ne1-mysql
REDIS_CONTAINER  = apple2ne1-redis
NGINX_CONTAINER  = apple2ne1-nginx

# ─────────────────────────────────────────────────────────────────────
# 1) 개발 서버: (빌드 후) 포어그라운드 실행
up:
	docker compose up --build

# 2) 개발 서버: 백그라운드 실행
up-d:
	docker compose up -d --build

# 3) 프로덕션 서버: prod 설정으로 백그라운드 실행
up-prod:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

# ─────────────────────────────────────────────────────────────────────
# 4) 이미지 빌드 (개발 / prod 공통)
build:
	docker compose build

# 5) 프로덕션 이미지 빌드
build-prod:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml build

# 6) 전체 재빌드 & 실행 (개발 모드)
rebuild: down build up-d

# ─────────────────────────────────────────────────────────────────────
# 7) 컨테이너 중지 & 삭제
down:
	docker compose down

# 8) 컨테이너 재시작
restart:
	docker compose restart

# ─────────────────────────────────────────────────────────────────────
# 9) 로그 보기
logs:
	docker compose logs -f

# 10) 컨테이너 상태 확인
ps:
	docker compose ps

status:
	@echo "====== apple2ne1 컨테이너 상태 ======"
	@docker ps --filter "name=apple2ne1" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# ─────────────────────────────────────────────────────────────────────
# 11) 개별 컨테이너 쉘 접근
bash-node:
	docker exec -it $(NODE_CONTAINER) sh

bash-mysql:
	docker exec -it $(MYSQL_CONTAINER) bash

bash-redis:
	docker exec -it $(REDIS_CONTAINER) sh

bash-nginx:
	docker exec -it $(NGINX_CONTAINER) sh

# ─────────────────────────────────────────────────────────────────────
# 12) 시스템 정리
prune:
	docker system prune -f
