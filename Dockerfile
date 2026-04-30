# 1. 베이스 이미지 선택 (주방 환경 설정)
# 가볍고 보안이 뛰어난 Alpine 리눅스 기반의 Node.js 20 버전을 사용합니다.
FROM node:24-alpine

# 2. 작업 디렉토리 생성 (도커 안의 작업 공간)
WORKDIR /app

# 3. 라이브러리 목록 복사 및 설치 (재료 준비)
# package.json만 먼저 복사해서 설치하면, 소스 코드가 바뀌어도 설치 과정을 생략해 속도가 빠릅니다.
COPY package.json ./
RUN npm install

# 4. 소스 코드 복사 (요리 시작)
COPY . .

# 5. 포트 설정 (손님용 문 열기)
# Vite의 기본 포트인 5173을 열어줍니다.
EXPOSE 5173

# Docker 안에서 localhost는 컨테이너 자신이므로, Windows 호스트의 백엔드는 host.docker.internal로 접근합니다.
ENV VITE_API_PROXY_TARGET=http://host.docker.internal:8080

# 6. 실행 명령 (서버 서빙)
# --host 옵션은 도커 외부(내 컴퓨터)에서 접속할 수 있게 해줍니다.
CMD ["npm", "run", "dev", "--", "--host"]