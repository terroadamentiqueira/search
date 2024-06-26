# Cloudflare KV Text Search API with Fuse.js

Esta aplicação fornece uma API REST para criar e buscar documentos utilizando o armazenamento KV da Cloudflare e a biblioteca Fuse.js para busca de texto.

## Índice

- Instalação
- Configuração
- Uso
- Endpoints
- Exemplos de Uso
- Licença

### Instalação

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio
npm install
```

### Configuração

Crie um arquivo `wrangler.toml` na raiz do projeto e configure seu namespace de KV:

```toml
name = "terroa-search"
main = "src/worker.ts"
compatibility_date = "2024-06-25"
workers_dev = true

[[kv_namespaces]]
binding = "keyvalname"
id = "000000000000000000000000000"
```

### Uso

Compile e publique o Worker:

```bash
npm run build
wrangler publish
```

### Endpoints

**POST /create**

Cria um novo documento.

Parâmetros:
- id (string): ID do documento.
- title (string): Título do documento.
- content (string): Conteúdo do documento.
- metadata (objeto): Metadados adicionais do documento (opcional).

#### Exemplo de Requisição
```bash
curl -X POST https://<seu-worker-url>/create -H "Content-Type: application/json" -d '{
  "id": "1",
  "title": "Título do Documento",
  "content": "Conteúdo do documento.",
  "metadata": { "autor": "John Doe", "data": "2024-06-25" }
}'
```

**GET /search**
Realiza a busca de documentos com base no parâmetro de consulta query.

Parâmetros:
- q (string): Termo de busca.

#### Exemplo de Requisição

```bash
curl https://<seu-worker-url>/search?q=conteúdo
```

### Exemplos de Uso

#### Criar Documento

```bash
curl -X POST https://<seu-worker-url>/create -H "Content-Type: application/json" -d '{
  "id": "1",
  "title": "Título do Documento",
  "content": "Conteúdo do documento.",
  "metadata": { "autor": "John Doe", "data": "2024-06-25" }
}'
```

#### Buscar Documentos

```bash
curl https://<seu-worker-url>/search?query=conteúdo
```

## Licença
Este projeto está licenciado sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.
