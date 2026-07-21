# NoPrumo

Plataforma de gestão de obras que centraliza operação de canteiro, suprimentos, financeiro e planejamento.

## Estado atual

Esta primeira entrega materializa o Centro de Controle Executivo como uma aplicação responsiva e navegável. Ela inclui:

- dashboard patrimonial e financeiro;
- filtro por obra com atualização dos indicadores;
- acompanhamento de progresso, marcos e desvios;
- alertas de SLA, estoque e cotações;
- rastreabilidade visual dos pedidos recentes;
- simulação de RBAC por perfil (Sede, Engenheiro, Encarregado e Cliente);
- experiência operacional adaptada ao celular para o Encarregado.
- módulo de Obras com indicadores, busca e filtro por situação;
- cadastro de nova obra integrado ao dashboard e persistido no navegador.
- Diário de Obra por projeto, com linha do tempo, clima, equipe, atividades e ocorrências;
- galeria e upload de fotos com compressão automática antes da persistência.
- gestão diária de presença por obra, com horários, vínculo e observações;
- marcação coletiva da equipe e exportação do relatório de presença em CSV.

Os dados iniciais demonstrativos ficam em `src/data.ts`. Obras, diário e presença passam pela API local, com isolamento por organização e persistência em arquivos dentro de `api/data`. O `localStorage` permanece apenas como cache de contingência da interface.

## Executar localmente

Requer Node.js 20 ou superior.

```bash
npm install
npm run dev
```

O comando inicia o frontend em `http://127.0.0.1:5173` e a API local em `http://127.0.0.1:3001`.

Credenciais do ambiente demonstrativo:

```text
E-mail: admin@noprumo.local
Senha:  noprumo123
```

O token da sessão é mantido em `sessionStorage` e expira após oito horas.

Endpoints disponíveis neste recorte:

```text
GET  /api/health
POST /api/auth/login
GET  /api/auth/me
GET  /api/projects
POST /api/projects
GET  /api/daily-logs
POST /api/projects/:projectId/daily-logs
GET  /api/attendance
PUT  /api/projects/:projectId/attendance/:date
```

Validação de produção:

```bash
npm run build
```

## Estrutura

```text
src/
  App.tsx       aplicação e componentes da primeira entrega
  data.ts       dados demonstrativos tipados
  main.tsx      inicialização do React
  styles.css    design system e layout responsivo
  types.ts      contratos principais do domínio
docs/
  architecture.md
  roadmap.md
```

Consulte [docs/architecture.md](docs/architecture.md) para as decisões de arquitetura e [docs/roadmap.md](docs/roadmap.md) para a sequência de implementação.
