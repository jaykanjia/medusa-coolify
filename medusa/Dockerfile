FROM node:23 as builder

WORKDIR /app/medusa

COPY . . 

RUN rm -rf node_modules

RUN apt-get update && apt-get install -y python3 python3-pip python-is-python3

RUN yarn install --loglevel=error

RUN yarn run build


FROM node:23

# Bug https://github.com/coollabsio/coolify/issues/1930
ARG COOKIE_SECRET
ARG JWT_SECRET
ARG STORE_CORS
ARG ADMIN_CORS
ARG AUTH_CORS
ARG DISABLE_ADMIN
ARG WORKER_MODE
ARG PORT
ARG DATABASE_URL
ARG REDIS_URL
ARG BACKEND_URL

ARG MEILISEARCH_API_KEY
ARG MEILISEARCH_HOST
ARG FRONTEND_URL
ARG RP_ID
ARG RP_NAME
ARG SSL
ARG ENABLE_HTTPS
ARG GOOGLE_CALLBACK_URL
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG REVCENT_API_ENDPOINT
ARG REVCENT_API_KEY
ARG REVCENT_CAMPAIGN_ID
ARG REVCENT_PAYMENT_PROFILE_ID
ARG REVCENT_PRODUCT_ID
ARG MINIO_S3_FILE_URL
ARG MINIO_S3_ACCESS_KEY_ID
ARG MINIO_S3_SECRET_ACCESS_KEY
ARG MINIO_S3_REGION
ARG MINIO_S3_BUCKET
ARG MINIO_S3_ENDPOINT
ARG SMTP_FROM
ARG SMTP_HOST
ARG SMTP_PORT
ARG SMTP_SECURE
ARG SMTP_AUTH_USER
ARG SMTP_AUTH_PASS
ARG SHIPPO_API_KEY
ARG KLAVIYO_API_KEY
ARG KLAVIYO_LIST_KEY


RUN echo "${PORT}"

WORKDIR /app/medusa

RUN mkdir .medusa

# COPY package*.json .yarnrc.yml yarn.lock ./ 

# COPY medusa-config.ts .
# COPY tsconfig.json .

RUN apt-get update && apt-get install -y python3 python3-pip python-is-python3

COPY --from=builder /app/medusa/.medusa ./.medusa

WORKDIR /app/medusa/.medusa/server

RUN yarn install --production


# RUN medusa migrations run 
COPY migrations.sh /app/medusa/.medusa/server/migrations.sh
RUN chmod +x /app/medusa/.medusa/server/migrations.sh
RUN /app/medusa/.medusa/server/migrations.sh

RUN rm /app/medusa/.medusa/server/migrations.sh

CMD ["yarn", "run", "start"]