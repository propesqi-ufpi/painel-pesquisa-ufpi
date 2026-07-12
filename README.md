# Painel de Pesquisa, Desenvolvimento e Inovação — UFPI
 
Sistema web de *dashboard* analítico desenvolvido como Trabalho de Conclusão de Curso (TCC) do Bacharelado em Ciência da Computação da Universidade Federal do Piauí (UFPI).
 
O sistema converte o painel institucional, anteriormente mantido em planilhas eletrônicas dispersas e em um arquivo Power BI, em uma aplicação web acessível via navegador. A plataforma centraliza dez domínios de indicadores de Pesquisa, Desenvolvimento e Inovação (P&D&I) da universidade, oferecendo autenticação, filtros interativos, visualizações gráficas e exportação de dados.
 
🔗 **Sistema em produção:** [painel-pesquisa-ufpi.vercel.app](https://painel-pesquisa-ufpi.vercel.app)
📦 **Repositório:** [github.com/emerymoriconi/painel-pesquisa-ufpi](https://github.com/emerymoriconi/painel-pesquisa-ufpi)
 
## Sumário
 
- [Visão geral](#visão-geral)
- [Acesso ao sistema em produção](#acesso-ao-sistema-em-produção)
- [Arquitetura](#arquitetura)
- [Stack tecnológica](#stack-tecnológica)
- [Pré-requisitos](#pré-requisitos)
- [Como executar](#como-executar)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Módulos do sistema](#módulos-do-sistema)
- [Testes](#testes)
- [Documentação da API](#documentação-da-api)
- [Estrutura do repositório](#estrutura-do-repositório)
## Visão geral
 
O fluxo de dados do sistema segue um pipeline que parte de planilhas Excel fornecidas pela administração da UFPI, passa por um processo de normalização e validação em Python, é persistido em um banco de dados relacional e é exposto por uma API REST autenticada, consumida por uma interface web interativa.
 
```
Excel (.xlsx) → Importação (Pandas) → PostgreSQL → API (FastAPI) → Interface (React)
```
 
## Acesso ao sistema em produção
 
O sistema está publicamente disponível, sem necessidade de instalação local:
 
| Serviço | URL |
|---|---|
| Interface web | https://painel-pesquisa-ufpi.vercel.app |
 
A aplicação é hospedada em três serviços de nuvem gratuitos e desacoplados (ver [Arquitetura](#arquitetura)): o *frontend* na Vercel, a API na Render e o banco de dados na Neon. Por conta do nível gratuito desses serviços, é importante observar:
 
- **Cold start do backend:** se a API ficar 15 minutos sem uso, ela entra em modo de inatividade. A primeira requisição após esse período pode levar de 30 a 60 segundos para responder, enquanto o serviço é reativado.
- **Banco de dados:** o *branch* computacional do Neon é congelado após 5 dias sem atividade, mas os dados permanecem preservados e consultáveis assim que reativado.
- **Credenciais de acesso:** a instância em produção usa as mesmas credenciais padrão descritas em [Como executar](#como-executar). Para fins de avaliação acadêmica, solicite acesso diretamente ao autor.
Para rodar o projeto localmente (por exemplo, para desenvolvimento ou testes com dados próprios), siga as instruções a partir da seção [Como executar](#como-executar).
 
## Arquitetura
 
O sistema é dividido em três camadas principais, orquestradas via Docker Compose:
 
- **Banco de dados (PostgreSQL):** persiste os dados estruturados em onze tabelas relacionais, uma para cada domínio de informação (projetos, propriedade intelectual, núcleos de pesquisa, entre outros), com o esquema versionado via Alembic.
- **Backend (FastAPI):** expõe uma API REST autenticada via JWT, organizada em onze *routers* — um por domínio —, cada um seguindo um padrão consistente de *endpoints* de indicadores, filtros, agregações, listagem paginada e consulta individual.
- **Frontend (React):** *Single Page Application* responsável pela renderização dos *dashboards*, filtros dinâmicos e gráficos interativos, consumindo a API por meio de um cliente HTTP centralizado.
Em produção, o Nginx atua como proxy reverso entre o navegador e os serviços de *backend* e *frontend* no ambiente local/containerizado. Na implantação em nuvem (ver [Acesso ao sistema em produção](#acesso-ao-sistema-em-produção)), esse papel é cumprido pela própria Vercel, que hospeda o *frontend* e reescreve as requisições `/api/...` para o *backend*.
 
## Stack tecnológica
 
| Camada | Tecnologias |
|---|---|
| **Backend** | Python 3.13 · FastAPI · SQLAlchemy 2.x · Alembic · Pydantic v2 · python-jose (JWT) · passlib (bcrypt) · Pandas · openpyxl |
| **Frontend** | React 18 · Vite · Tailwind CSS · React Router v6 · Axios · Recharts |
| **Infraestrutura** | Docker · Docker Compose · Nginx · Vercel · Render · Neon |
| **Testes** | pytest (backend) · Vitest + React Testing Library (frontend) |
 
## Pré-requisitos
 
> As instruções abaixo são necessárias apenas para executar o projeto **localmente**. Para apenas utilizar o sistema, acesse diretamente o [link em produção](#acesso-ao-sistema-em-produção).
 
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e em execução
- Arquivos `.xlsx` com os dados de origem posicionados em `backend/data/xlsx/`
## Como executar
 
### 1. Subir os serviços
 
Na raiz do projeto, construa e inicie todos os contêineres (banco de dados, API e *frontend*):
 
```bash
docker compose up --build
```
 
### 2. Aplicar as migrações do banco de dados
 
Na primeira execução, é necessário aplicar o esquema do banco de dados gerenciado pelo Alembic:
 
```bash
docker compose exec api alembic upgrade head
```
 
### 3. Importar os dados das planilhas
 
Também na primeira execução, popule o banco de dados a partir dos arquivos Excel:
 
```bash
docker compose exec api python scripts/import_xlsx.py
```
 
> Esse comando dispara os *importers* específicos de cada domínio (projetos, produção intelectual, núcleos, bolsistas, grupos de pesquisa, infraestrutura), normalizando os dados antes da persistência.
 
### 4. Acessar a aplicação
 
| Serviço | URL |
|---|---|
| Interface web (*frontend*) | http://localhost:3000 |
| Documentação interativa da API (Swagger) | http://localhost:8000/docs |
| Verificação de saúde da API | http://localhost:8000/health |
 
### Credenciais de acesso padrão
 
O sistema possui um usuário administrador configurado via variáveis de ambiente, sem necessidade de cadastro prévio no banco de dados:
 
- **Usuário:** `admin`
- **Senha:** definida pelo *hash* informado na variável de ambiente `ADMIN_PASSWORD_HASH`
Alternativamente, é possível cadastrar novos usuários pelo *endpoint* `/auth/cadastro`, persistidos na tabela `usuarios` com senha protegida por *hash bcrypt*.
 
## Variáveis de ambiente
 
As configurações sensíveis da aplicação são lidas de um arquivo `.env`, nunca *hardcoded* no código-fonte. As principais variáveis incluem:
 
| Variável | Descrição |
|---|---|
| `DATABASE_URL` | URL de conexão com o PostgreSQL |
| `SECRET_KEY` | Chave usada para assinar os *tokens* JWT (algoritmo HS256) |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD_HASH` | Credenciais do usuário administrador padrão |
| `ALLOWED_ORIGINS` | Origens permitidas pelo CORS (padrão: `localhost:3000`, `localhost:5173`) |
| `ULTIMA_ATUALIZACAO` | Data de referência exibida no *dashboard* como última atualização dos dados |
 
## Módulos do sistema
 
| Módulo | Descrição |
|---|---|
| **Home** | Indicadores-chave (KPIs) gerais da instituição, com navegação direta para os demais módulos |
| **Projetos PD&I** | Projetos de pesquisa, desenvolvimento e inovação cadastrados na UFPI |
| **Projetos FINEP** | Projetos financiados especificamente pela Financiadora de Estudos e Projetos (FINEP) |
| **Produção Intelectual** | Patentes, *softwares*, marcas e desenhos industriais registrados |
| **Bolsistas** | Bolsistas de produtividade em pesquisa do CNPq e da UFPI |
| **Núcleos de Pesquisa** | Núcleos de pesquisa institucionais, ativos e inativos |
| **Grupos de Pesquisa** | Grupos de pesquisa certificados na base DGP/CNPq |
| **Empresas Incubadas** | Empresas em incubação e graduadas pela incubadora INBATE |
| **Pós-Graduação** | Programas de pós-graduação *stricto sensu*, com conceito CAPES |
| **Laboratórios** | Laboratórios cadastrados na base PNIPE/MCTI |
 
Cada módulo oferece indicadores agregados, gráficos de distribuição interativos (construídos com Recharts), tabelas paginadas com filtros específicos ao domínio, e exportação dos dados em CSV ou dos gráficos em PNG.
 
## Testes
 
O projeto possui uma suíte automatizada de testes para ambas as camadas, seguindo a estratégia de pirâmide de testes (unitários na base, integração no topo).
 
### Backend
 
```bash
cd backend
pytest tests/ -v --cov=app
```
 
A suíte conta com 141 testes (24 unitários e 117 de integração via SQLite), com 100% de aprovação e 96% de cobertura de código.
 
### Frontend
 
```bash
cd frontend
npm test
```
 
A suíte conta com 198 testes entre componentes, páginas e contextos globais, com 196 aprovações, 2 ignorados (por incompatibilidade conhecida entre React 19 e Vitest 4) e cobertura de 78% de linhas.
 
## Documentação da API
 
Com a aplicação em execução, a documentação interativa da API (gerada automaticamente pelo FastAPI a partir dos *schemas* Pydantic) fica disponível em:
 
```
http://localhost:8000/docs
```
 
## Estrutura do repositório
 
```
.
├── backend/
│   ├── app/
│   │   ├── main.py            # Inicialização da API e middlewares
│   │   ├── database.py        # Configuração da conexão com o PostgreSQL
│   │   ├── models.py          # Modelos ORM (SQLAlchemy)
│   │   ├── schemas.py         # Schemas de validação e serialização (Pydantic)
│   │   ├── auth.py            # Autenticação JWT
│   │   ├── dependencies.py    # Injeção de dependências (sessão de banco)
│   │   └── routers/           # Endpoints REST, um arquivo por domínio
│   ├── scripts/
│   │   ├── import_xlsx.py     # Script orquestrador da importação
│   │   └── importers/         # Rotinas de importação por domínio
│   ├── data/xlsx/              # Planilhas de origem dos dados
│   ├── alembic/                # Migrações do banco de dados
│   └── tests/                  # Testes automatizados (pytest)
├── frontend/
│    └──src/
│      ├── pages/              # Páginas de cada módulo de domínio
│      ├── components/         # Componentes reutilizáveis (cards, tabelas, filtros)
│      ├── contexts/           # Contextos globais (autenticação, tema)
│      ├── tests/              # Testes automatizados (Vitest)  
│      └── api/                # Cliente HTTP centralizado (Axios)                   
└── docker-compose.yml
```
 
---
 
Desenvolvido por **Émery Freitas Moriconi** como Trabalho de Conclusão de Curso — Bacharelado em Ciência da Computação, Universidade Federal do Piauí (UFPI).
