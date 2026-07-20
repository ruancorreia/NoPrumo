# Arquitetura inicial

## Direção técnica

A interface foi iniciada com React, TypeScript e Vite. A separação entre dados (`data.ts`), contratos (`types.ts`) e apresentação permite substituir os mocks por uma API sem reescrever a experiência.

Para produção, a evolução recomendada é um monorepo com:

- `apps/web`: interface React atual;
- `apps/api`: API HTTP modular;
- `packages/domain`: regras de negócio e contratos compartilhados;
- `packages/ui`: componentes visuais reutilizáveis;
- PostgreSQL com isolamento por `tenant_id` e `obra_id`;
- fila de jobs para alertas de SLA, estoque mínimo e geração de documentos;
- armazenamento compatível com S3 para fotos, recibos e documentos.

## Limites de domínio

1. **Identidade e acesso**: organizações, usuários, perfis e vínculos com obras.
2. **Obras e planejamento**: obras, etapas, tarefas, checklists e marcos.
3. **Canteiro**: diário, fotos, presença, solicitações e recebimentos.
4. **Suprimentos**: materiais, estoque, fornecedores, cotações e pedidos.
5. **Financeiro**: centros de custo, lançamentos, contas, pagamentos e recibos.
6. **Notificações**: alertas, SLA e preferências de entrega.

## Segurança

- Toda tabela de negócio deve ter `tenant_id`.
- Dados vinculados a uma obra também devem ter `obra_id`.
- A autorização deve ser validada na API e reforçada por Row Level Security no PostgreSQL.
- URLs de fotos e documentos devem ser temporárias e assinadas.
- Alterações financeiras, aprovações e baixas devem gerar trilha de auditoria imutável.

## Perfis

| Perfil | Escopo inicial |
| --- | --- |
| Sede / Admin | Todas as obras, financeiro, usuários, aprovações e relatórios |
| Engenheiro / Mestre | Obras vinculadas, planejamento, diário e suprimentos |
| Encarregado / Pedreiro | Obra atual, presença, diário, pedidos e recebimentos |
| Dono da obra | Consulta de progresso, fotos, pagamentos e gastos autorizados |
