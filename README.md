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

Os dados são demonstrativos e ficam em `src/data.ts`. Autenticação, persistência e integrações serão adicionadas nas próximas etapas.

## Executar localmente

Requer Node.js 20 ou superior.

```bash
npm install
npm run dev
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
