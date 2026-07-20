# Roadmap sugerido

## Fase 1 — Fundação e canteiro

- autenticação e recuperação de acesso;
- organizações, usuários, obras e vínculos de acesso;
- cadastro de obra, etapas e equipe;
- diário de obra com fotos;
- presença diária;
- pedido de material e confirmação de recebimento;
- trilha de auditoria.

## Fase 2 — Suprimentos

- catálogo de materiais e estoque por obra;
- fornecedores e histórico de preços;
- cotação comparativa com até cinco fornecedores;
- aprovação e ciclo completo do pedido;
- alertas de estoque mínimo e SLA de recebimento;
- classificação de Curva ABC.

## Fase 3 — Financeiro

- plano de contas e centros de custo;
- contas a pagar e receber;
- conciliação com pedidos e mão de obra;
- recibos digitais;
- orçamento previsto versus realizado por etapa;
- dashboard executivo alimentado por dados reais.

## Fase 4 — Planejamento e portal do cliente

- Kanban e cronograma por etapa;
- checklists de qualidade e segurança;
- central de documentos;
- portal de transparência do dono da obra;
- notificações multicanal e relatórios executivos.

## Primeiro recorte de API

O primeiro recorte deve cobrir `auth`, `organizations`, `projects`, `memberships`, `daily-logs`, `attendance`, `material-requests` e `receipts`. Essa sequência valida o uso diário no canteiro antes de ampliar a complexidade financeira.
