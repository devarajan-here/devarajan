FROM node:20-alpine

WORKDIR /app

# Enable pnpm
RUN corepack enable

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Expose Vite default port
EXPOSE 5173

# Start the dev server with --host to allow external access
CMD ["pnpm", "run", "dev", "--host"]
