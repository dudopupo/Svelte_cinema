# --- Build stage ---------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies without lifecycle scripts: paraglide and SvelteKit
# generate their output during `vite build`, and husky needs a git checkout.
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build
# Keep only runtime dependencies for the final image.
RUN npm prune --omit=dev

# --- Runtime stage -------------------------------------------------------
FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

COPY --from=build /app/package.json ./package.json
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/build ./build

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
	CMD wget -qO- "http://127.0.0.1:${PORT}/" > /dev/null || exit 1

CMD ["node", "build"]
