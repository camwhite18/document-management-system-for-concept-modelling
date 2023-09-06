run-web:
	@echo "Running development server..."
	@python web/api/manage.py runserver

all: build run

build:
	@echo "Building docker image..."
	@docker-compose build

run:
	@echo "Running development server..."
	@docker-compose up -d

remove:
	@echo "Removing development server..."
	@docker-compose down

test-api:
	@echo "Running tests..."
	@docker-compose run --rm web python /home/api/manage.py test

test-ui:
	@echo "Running tests..."
	@docker-compose run --rm web npm run test --prefix /home/frontend

test: test-api test-ui

unzip:
	@echo "Unzipping..."
	@unzip -o -d ./web/api/ ./web/api/ner-model.zip