# Variables
APP_NAME=cpf-frontend

.PHONY: help run build mock test cover docs clean docker-build docker-start docker-stop

# Tasks
default: help

help: ## Exibe esta mensagem de ajuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
test: ## Executa os test automatizados da aplicação
	@echo "Executando os testes automatizados..."

# ==========
# DOCKER
# ==========
CONTAINER_NAME=cpf-frontend

docker-build: ## Cria a imagem docker com a aplicacao, usando o docker-compose.yaml
	docker compose build
docker-rebuild: ## Recria a imagem docker com a aplicação, para o container e sobe novamente
	docker compose up -d --build
docker-start: ## Inicia o container da aplicação
	docker compose up -d
docker-stop: ## Para o container da aplicação
	docker compose down
docker-ps: ## Listar o container rodando
	-docker ps | grep ${CONTAINER_NAME}
docker-image: ## Para ver as imagens existentes
	docker images | grep $(APP_NAME)
docker-logs: ## Mostra o log do container
	docker logs ${CONTAINER_NAME}
docker-logs-f: ## Mostra o log do container com opção -f
	docker logs -f ${CONTAINER_NAME}
docker-exec: ## Entra dentro do container com ash
	docker exec -it ${CONTAINER_NAME} ash