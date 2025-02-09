# PRODUCTION DOCKERFILE
# ---------------------
# This Dockerfile allows to build a Docker image of the NestJS application
# and based on a NodeJS 16 image. The multi-stage mechanism allows to build
# the application in a "builder" stage and then create a lightweight production
# image containing the required dependencies and the JS build files.
# 
# Dockerfile best practices
# https://docs.docker.com/develop/develop-images/dockerfile_best-practices/
# Dockerized NodeJS best practices
# https://github.com/nodejs/docker-node/blob/master/docs/BestPractices.md
# https://www.bretfisher.com/node-docker-good-defaults/
# http://goldbergyoni.com/checklist-best-practice-of-node-js-in-production/


# Credit: https://github.com/Saluki/nestjs-template/blob/master/Dockerfile

FROM node:20-alpine as builder

ENV NODE_ENV build

RUN addgroup -S app && adduser -S app -G node
RUN chown -R app:node /home/node

# Add git to be able to clone the "RevolutionUC-emails" repo
RUN apk add --no-cache git

USER root
WORKDIR /home/node

COPY --chown=node package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY --chown=node . .

# Fly.io build secrets: https://fly.io/docs/reference/build-secrets/
RUN yarn run build \
    && yarn install --production

# ---

LABEL fly_launch_runtime="nodejs"

FROM node:20-alpine

ENV NODE_ENV production

USER node
WORKDIR /home/node

COPY --from=builder /home/node/package*.json /home/node/
COPY --from=builder /home/node/node_modules/ /home/node/node_modules/
COPY --from=builder /home/node/dist/ /home/node/dist/

EXPOSE 8080

CMD ["node", "dist/main.js"]
