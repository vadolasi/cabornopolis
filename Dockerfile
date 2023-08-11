FROM node:18

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./
RUN npm i -g pnpm && pnpm i --ignore-scripts
COPY . .
RUN pnpm exec prisma generate
ENV NODE_ENV production
ENV PORT 3000
EXPOSE 3000

CMD ["pnpm", "run", "dev"]
