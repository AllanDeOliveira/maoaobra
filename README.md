# mãoAobra 🛠️

O **mãoAobra** é um marketplace de serviços rápidos, criado como projeto acadêmico. Ele funciona como uma plataforma estilo "iFood" para conectar prestadores de serviço (Eletricistas, Encanadores, Diaristas, etc.) a clientes que precisam de reparos imediatos.

Este projeto foi construído focando na excelência da Interface do Usuário (UI) e na Experiência do Usuário (UX), possuindo um design responsivo (*Mobile-First*) altamente focado em usabilidade e acessibilidade.

## 🌟 Principais Funcionalidades

- **Múltiplos Perfis de Usuário:** Diferentes experiências para Clientes, Trabalhadores e Administradores.
- **Busca por Proximidade Geométrica:** O algoritmo de busca organiza e exibe primeiro os profissionais que estão mais perto do cliente (baseado em Cidade/UF).
- **Validação Temporal Inteligente:** O profissional escolhe seu horário de expediente. Fora do horário, o sistema bloqueia automaticamente novas solicitações e marca o profissional como "Indisponível".
- **Sistema de Agendamento e Chat Local:** Fluxos completos de simulação de pedido com notificações e mudança de status em tempo real.
- **Feedback Sensorial:** O aplicativo conta com *Toast Notifications* visuais acompanhadas de bips de áudio dinâmicos.
- **Mobile First e Design Premium:** Utilizando TailwindCSS para criar um visual fluído, claro e perfeitamente legível em telas pequenas.

## 🛠️ Tecnologias Utilizadas

- **[React 19](https://react.dev/)**: Biblioteca central para a criação das interfaces de usuário.
- **[Vite](https://vitejs.dev/)**: Bundler e ambiente de desenvolvimento ultrarrápido.
- **[Tailwind CSS v4](https://tailwindcss.com/)**: Framework de estilização utilitária para o design moderno e responsivo.
- **[Zustand](https://github.com/pmndrs/zustand)**: Gerenciamento global de estado (Mock State).
- **[Firebase Realtime Database](https://firebase.google.com/)**: Utilizado para persistir os dados mockados, permitindo que a aplicação se comporte como se tivesse um backend real de produção.
- **[Phosphor Icons / Lucide](https://phosphoricons.com/)**: Iconografia vetorial rica.

## 🚀 Como Executar Localmente

Siga os passos abaixo para rodar a aplicação no seu computador:

1. Clone este repositório:
   ```bash
   git clone https://github.com/Kanastrilha/maoaobra.git
   ```

2. Acesse a pasta do projeto:
   ```bash
   cd maoaobra
   ```

3. Instale as dependências:
   ```bash
   npm install
   ```

4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

5. O aplicativo estará rodando em `http://localhost:5173`.

## 👥 Contas de Demonstração para Teste

A aplicação inicia com o banco de dados carregado com perfis de teste. Você pode fazer o login sem precisar criar uma conta usando as credenciais abaixo:

**Senha para todas as contas:** `123`

- **Administrador:** `legalmano@gmail.com`
- **Trabalhador (Eletricista):** `eduardo@gmail.com`
- **Trabalhador (TI):** `ti@gmail.com`
- **Cliente:** `pedro@gmail.com`

## 🌐 Deploy
A aplicação está configurada para rodar nativamente via **GitHub Pages**. Toda alteração na branch `main` pode ser rapidamente publicada no site ao vivo usando o script configurado no projeto:
```bash
npm run deploy
```

---
*Projeto desenvolvido para fins educacionais e apresentação de Trabalho de Conclusão (TCC).*
