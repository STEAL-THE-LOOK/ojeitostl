# Changelog - O Jeito STL

## 2026-03-17

### Atualizacoes no hero e modal de lista de espera

- CTA principal do hero alterado para "Entrar na lista de espera".
- Acao do CTA alterada para abrir modal em vez de redirecionar para link externo.
- Modal de lista de espera implementado com formulario completo.
- Corrigido bug de abertura do modal no CTA do primeiro bloco.
- Tipografia do formulario reduzida para alinhamento com o padrao visual do site.
- Scrollbar do modal refinada para melhor acabamento visual.

### Integracao com Beehiiv

- Frontend conectado a endpoint de envio para lista de espera.
- Endpoint serverless criado para Vercel em `api/beehiiv-waitlist.js`.
- Fluxo com tratamento de estado de envio, sucesso e erro.
- Endpoint padrao do frontend ajustado para `/api/beehiiv-waitlist`.

### Pendente de configuracao

- Configurar variaveis de ambiente do Beehiiv na Vercel:
  - `BEEHIIV_API_KEY`
  - `BEEHIIV_PUBLICATION_ID`
  - IDs de custom fields (opcional)
