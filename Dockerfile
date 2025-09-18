FROM oven/bun:latest
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl;
COPY . .
EXPOSE 8080
CMD ["bun", "start"]
