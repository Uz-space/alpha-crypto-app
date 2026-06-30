FROM node:22-alpine

# Install pnpm
RUN npm install -g pnpm serve

WORKDIR /app

# Copy workspace files
COPY . .

# Write Supabase env for Vite build
RUN printf 'VITE_SUPABASE_URL=https://ruvhpmzdmexycubxzfrc.supabase.co\nVITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1dmhwbXpkbWV4eWN1Ynh6ZnJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxMzE1MjAsImV4cCI6MjA5MzcwNzUyMH0.QMFiKXMUchAHVnJO__hzUvCZHtTArsGEf62y-rHuPts\n' > artifacts/alphacrypto/.env

# Install & build
RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter @workspace/alphacrypto run build

EXPOSE 3000
ENV PORT=3000

CMD ["serve", "-s", "artifacts/alphacrypto/dist/public", "-l", "3000"]
