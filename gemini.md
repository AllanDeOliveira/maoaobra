# Construtor de Marketplaces de Serviços (MãoAobra)

## Função

Atue como um Arquiteto de Software Sênior e Engenheiro Full Stack Líder. Você constrói aplicações web complexas, dinâmicas e com estado perfeitamente gerenciado, "1:1 Pixel Perfect". Seu objetivo é construir o **mãoAobra**, um marketplace de serviços rápidos inspirado na logística do iFood. O sistema não usará um SGBD real (apenas alocação em memória via arrays/objetos), mas o código deve simular perfeitamente um ambiente de produção. Erradique componentes genéricos; cada tela deve parecer um produto maduro e pronto para o mercado.

## Regras de Arquitetura de Dados (NUNCA ALTERE)

Como não haverá backend externo, você DEVE criar um arquivo `store.js` ou um Contexto Global (ex: React Context / Zustand) que inicialize com um **Mock Data Robusto**. As entidades obrigatórias são:

1. **Users:** `{ id, nome, email, senha, role: 'CONTRATANTE' | 'TRABALHADOR', avatar_url, telefone }`
2. **Workers_Profile:** `{ user_id, bio, categorias[], nota_media, portfolio_fotos: [] }` *(Obrigatório array de URLs de imagens para mostrar trabalhos anteriores).*
3. **Services:** `{ id, worker_id, titulo, descricao, preco_base, tempo_estimado }`
4. **Orders (Pedidos):** `{ id, contratante_id, worker_id, service_id, status, data, endereco, valor, chat_history: [] }`
5. **Reviews (Avaliações):** `{ id, order_id, worker_id, contratante_id, nota, comentario, fotos: [], data }` *(Obrigatório permitir anexar URLs de imagens na avaliação).*

**Ciclo de Vida do Pedido (Strict State Machine):**
`PENDENTE` → `ACEITO` (ou `RECUSADO`) → `EM_ANDAMENTO` → `CONCLUIDO`.

---

## Design System e Micro-Interações

* **Estética "Trust & Clean":** O design deve transmitir confiança e agilidade. Fundo Off-white (`#F9FAFB`), Superfícies Brancas (`#FFFFFF`), Primária Laranja/Avermelhada (estilo iFood - `#EA1D2C`), Textos em Carvão (`#1F2937`).
* **Feedback Visual:** Qualquer ação de CRUD (aceitar pedido, enviar mensagem, avaliar) DEVE disparar um Toast de notificação (ex: "Serviço Aceito!").
* **Imagens:** Todas as fotos de perfil, portfólio e avaliações devem usar `object-cover`, ter bordas arredondadas (`rounded-xl` ou `rounded-full` para avatares) e *fallbacks* elegantes caso a URL falhe.
* **Transições:** Use transições suaves (`transition-all duration-200 ease-in-out`) em todos os hovers de botões e cards de serviços.

---

## Arquitetura de Componentes e Telas (Construa Exatamente Esta Estrutura)

### A. MÓDULO DE AUTENTICAÇÃO (O Portão de Entrada)

* **Tela de Login:** Inputs limpos, botão de submit magnético.
* **Tela de Registro com Toggle:** Um *Switch* elegante no topo: "Quero Contratar" vs "Quero Trabalhar".
* Se "Trabalhador" for selecionado, expanda campos extras para: Categorias de atuação e Upload de Foto de Perfil (simulado via input de URL).

### B. VISÃO DO CONTRATANTE (A Experiência de Consumo)

1. **Home Feed:**
* Barra de busca global pegajosa (sticky).
* Carrossel horizontal de "Categorias" (ex: Limpeza, Elétrica, TI).
* Grade de "Trabalhadores em Destaque" (ordenados por maior `nota_media`).


2. **Perfil do Trabalhador:**
* Header com Foto grande, Nome, Nota e botão de contato.
* Aba 1: **Serviços** (Lista de serviços oferecidos com preço. Clicar abre modal de Checkout).
* Aba 2: **Portfólio** (Grade de imagens de trabalhos anteriores do `portfolio_fotos`).
* Aba 3: **Avaliações** (Feed de comentários, estrelas e *fotos anexadas pelos clientes*).


3. **Meus Pedidos & Acompanhamento:**
* Lista de pedidos ativos e histórico.
* Ao clicar num pedido ativo, exibe uma linha do tempo (Timeline) com o status atual e a interface do Chat Integrado (abaixo).



### C. VISÃO DO TRABALHADOR (O Centro de Comando)

1. **Dashboard Financeiro & Radar:**
* Cards superiores: "Ganhos do Mês", "Serviços Concluídos", "Avaliação Média".
* Feed de "Solicitações Pendentes" com botões proeminentes (Verde para Aceitar, Vermelho para Recusar).


2. **Meus Serviços (CRUD):**
* Interface de gerenciamento onde ele adiciona novos serviços ao seu catálogo, define preços e adiciona fotos ao seu portfólio.


3. **Painel de Execução:**
* Visão focada nos pedidos `EM_ANDAMENTO`. Botões de ação para alterar o status para `CONCLUIDO`.



### D. SISTEMA DE COMUNICAÇÃO E AVALIAÇÃO (O Coração da Plataforma)

* **Chat do Pedido:** Uma janela de chat amarrada ao `order_id`. Mensagens aparecem em bolhas (estilo WhatsApp) simulando o tempo real via estado local.
* **Fallback de WhatsApp:** Em todas as telas de pedido ativo e perfil de trabalhador, um botão fixo com o ícone do WhatsApp que gera dinamicamente: `href="[https://wa.me/](https://wa.me/)[numero]?text=Ola vi seu perfil no maoAobra..."`.
* **Modal de Avaliação (Post-job):** Quando o trabalhador marca o pedido como `CONCLUIDO`, o contratante recebe um modal obrigatório. Ele deve escolher de 1 a 5 estrelas, digitar um texto e ter uma opção de "Adicionar Foto do Resultado" (input de URL simulado).

---

## Requisitos Técnicos de Execução

* **Stack:** React (ou Next.js), Tailwind CSS, Framer Motion (para animações de modal e abas), Lucide React (para iconografia completa).
* **Gerenciamento de Estado Mestre:** Crie um *Mock Provider* robusto que envolva toda a aplicação, de modo que se o Trabalhador mudar o status do pedido, e o usuário "deslogar" e entrar como Contratante, ele veja o status atualizado no painel dele.
* **Responsividade Obrigatória:** O layout deve ser Mobile-First. Use uma *Bottom Navigation Bar* (Barra de navegação inferior) para dispositivos móveis contendo (Home, Buscas, Pedidos, Perfil), igual a aplicativos nativos.
* **Sem Placeholders Genéricos:** O sistema DEVE inicializar com dados convincentes. Escreva nomes reais, serviços reais (ex: "Instalação de Chuveiro", "Formatação de PC") e avaliações com textos críveis.

*Diretriz de Execução:* Construa o código completo e roteado. Não pule nenhuma tela ou regra de negócio. O aplicativo deve ser perfeitamente testável apenas rodando o ambiente local.
