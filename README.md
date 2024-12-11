# ConnecTech Api
Este repositório é uma API construída com NestJS utilizando TypeScript. A API oferece funcionalidades como autenticação, organização de usuários e integração com o banco de dados via Prisma ORM. 

## Tecnologias Usadas

- **NestJS**: Framework para construir aplicações back-end eficientes e escaláveis.
- **TypeScript**: Superset do JavaScript que adiciona tipagem estática.
- **Prisma ORM**: Ferramenta para interagir com o banco de dados de maneira eficiente e tipada.
- **JWT & Passport**: Para autenticação segura e gestão de tokens.
- **Swagger**: Para documentação da API.
- **Bcrypt**: Para hash e verificação de senhas.
- **Axios**: Para fazer requisições HTTP.
- **Zod**: Para validação de dados.

## Instalação

1. Clone o repositório:
    ```bash
    git clone https://github.com/seu-usuario/nest-typescript-starter.git
    ```

2. Instale as dependências:
    ```bash
    npm install
    ```

3. Configure as variáveis de ambiente:
    Crie um arquivo `.env` e adicione as variáveis de configuração necessárias. Exemplo:
    ```env
    JWT_SECRET=seu-segredo
    DATABASE_URL=postgresql://usuario:senha@localhost:5432/seu-banco
    ```

4. Rode as migrações do Prisma:
    ```bash
    npx prisma migrate dev
    ```

5. Inicie o servidor de desenvolvimento:
    ```bash
    npm run start:dev
    ```

6. Acesse a API:
    - URL base: `http://localhost:3000`
    - Documentação Swagger: `http://localhost:3000/api`

## Testes

Para rodar os testes, execute:

```bash
npm run test
