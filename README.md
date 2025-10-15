# CPF-MANAGEMENT - cpf-frontend

Este é o repositório do frontend da aplicação **CPF-MANAGEMENT**, desenvolvido utilizando Vue.js 3 com a Composition API e TypeScript. A aplicação é conteinerizada e gerenciada via docker-compose.yaml para facilitar o desenvolvimento e a implantação local.

## Tecnologias Utilizadas
- Framework: Vue.js 3 (com script setup e Composition API)
- Linguagem: TypeScript
- Estilização/Componentes: PrimeVue
- Empacotador: Vite
- Comunicação: Axios
- Conteinerização: Docker e Docker Compose

## Pré-requisitos
Antes de começar, você deve ter as seguintes ferramentas instaladas no seu sistema:
1. Git: Para clonar o repositório.
2. Node.js versão 22.19+ e npm/yarn/pnpm.
3. Docker e Docker Compose: Para construir e executar o container da aplicação.


## Primeiros Passos

1. Clonar o Repositório
```bash
git clone https://github.com/valdinei-santos/cpf-frontend.git
cd cpf-frontend
```

2. Configuração de Variáveis de Ambiente
```bash
cp .env.example .env.production
```
Edite o arquivo `.env.production` com as configurações do seu ambiente. No mínimo, você precisará configurar a URL da sua API de backend:
```bash
VITE_API_BASE_URL=http://localhost:8889/api/v1
```


## Executando com Docker Compose (Modo Padrão)
O `docker-compose.yaml` irá construir a imagem do frontend (baseada no Dockerfile) e iniciá-lo, usando um servidor web Nginx para servir os arquivos estáticos.
Observação: O modo de execução via Docker Compose abaixo é otimizado para produção/simulação de produção, servindo arquivos estáticos de forma eficiente.

```bash
# 1. Constrói a imagem do Docker e inicia o serviço
docker-compose up --build -d
```

**Acessando a Aplicação**  
A aplicação estará disponível em seu navegador no endereço:
http://localhost:8888 (Ou outra porta configurada no seu docker-compose.yaml)

**Comandos Úteis do Docker**
```bash
docker-compose down                       --> Para e remove os containers, redes e volumes criados.
docker-compose logs -f                    --> Exibe os logs do container em tempo real.
docker-compose exec frontend ash          --> Entra no terminal do container (útil para debug).
```

## Executando em Modo Desenvolvimento (Localmente)
Para um ciclo de desenvolvimento rápido (com Hot Module Reloading), é recomendado rodar o projeto diretamente com Node.js na sua máquina.
```bash
# 1. Instala as dependências
npm install # ou yarn install / pnpm install

# 2. Inicia o servidor de desenvolvimento (HMR)
npm run dev # ou yarn dev / pnpm dev
```
A aplicação estará disponível em http://localhost:5173 (porta padrão do Vite).


## Detalhes do Docker Compose
O arquivo docker-compose.yaml define o serviço frontend:
```yaml
services:
  frontend:
    build:
      context: . 
      dockerfile: Dockerfile
    image: cpf-management/frontend:1.0.0
    container_name: frontend
    ports:
      - "0.0.0.0:8888:80"
    restart: unless-stopped    
    networks:
      - mongo-network
    
networks:
  mongo-network:
    driver: bridge
```

## Estrutura de Diretórios
```
cpf-frontend/
├── node_modules/
├── public/
├── src/                      # Código fonte da aplicação
│   ├── assets/               # Imagens, fontes, estilos globais
│   ├── components/           # Componentes reutilizáveis
│   ├── composables/          # Funções de lógica reativa (ex: useCliente.ts)
│   ├── router/               # Configuração do Vue Router
│   ├── types/                # Tipos usados na aplicação
│   ├── utils/                # Funções úteis para aplicação
│   ├── views/                # Componentes de página (rotas)
│   ├── App.vue
│   └── main.ts               # Ponto de entrada
├── .env.example              # Exemplo de .env.production usado na aplicação
├── Dockerfile                # Configuração de construção do container
├── docker-compose.yaml       # Configuração do ambiente multi-container
├── package.json
├── Makefile                  # Automatização de comandos em ambientes bash
├── README.md
└── vite.config.ts
```

## Scripts Disponíveis
No arquivo `package.json`, você pode encontrar os seguintes scripts:  
- `npm run dev`:         Inicia o servidor de desenvolvimento com HMR.
- `npm run build-only`:  Compila o projeto para produção na pasta dist/.
- `npm run build`:       Roda o projeto em modo produção.
