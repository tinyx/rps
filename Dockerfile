# Build the Django static assets
FROM lucaspickering/rps-api:latest as django-builder
RUN ./manage.py collectstatic --no-input

# Build the JS artifact
FROM lucaspickering/rps-webapp:latest as js-builder
RUN npm run build

# Build the static file image
FROM alpine:latest
WORKDIR /app/static
COPY --from=django-builder /app/api/static/ static/
COPY --from=js-builder /app/webapp/build/ .
