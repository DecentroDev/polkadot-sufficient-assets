ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine AS alpine

FROM alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder

# Set working directory
WORKDIR /app
RUN pnpm add turbo --global
COPY . .
RUN turbo prune mini-app --docker

RUN pnpm install --frozen-lockfile
RUN pnpm build

EXPOSE 3000
CMD [ "pnpm", "run", "preview" ]


