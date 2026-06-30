# Deepagent

Angular test app for evaluating the LangChain Deep Agents TypeScript SDK through a backend/proxy-first architecture.

## Start Development

Install dependencies:

```bash
npm install
```

Start the Angular frontend:

```bash
npm start
```

The frontend runs at `http://localhost:4200/`.
During local development, Angular proxies `/api` requests to the backend at `http://127.0.0.1:3000/`.

Start the backend/proxy in a second terminal:

```bash
npm run server
```

The backend runs at `http://127.0.0.1:3000/`.

Useful backend endpoints:

- `GET http://127.0.0.1:3000/api/health`
- `POST http://127.0.0.1:3000/api/agent-runs`

The agent-run endpoint currently emits placeholder Server-Sent Events. The real Deep Agents SDK integration belongs in the backend, not in the Angular browser bundle.

## Environment

Copy `.env.example` to `.env` when backend-only secrets or local overrides are needed.

```bash
cp .env.example .env
```

Do not put model credentials or privileged tool configuration in Angular browser environment files.

The overview quickstart uses `@langchain/openai` with backend-only `OPENAI_API_KEY`.
Set `OPENAI_MODEL` to change the model; the default is `gpt-5`.

## Quality Checks

```bash
npm run format:check
npm run lint
npm test -- --watch=false
npm run typecheck
```

## Build

```bash
npm run build
```
