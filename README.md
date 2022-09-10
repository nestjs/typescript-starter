## clinestetic
App para segmento de estética

## Pré-requisitos

- Node.js, versão 10.13 ou superior;
- Nest CLI (opcional, mas recomendado);
- PostgreSQL/mysql etc, versão 9 ou superior (pode ser via Docker).


## DATABASE

Obs.: Crie um arquivo na raiz do projeto de nome ".env" e Add as configurações de acesso ao seu banco de dados(username ) no arquivo da aplicação.

- Cole as informações abaixo no seu arquivo .env e salve:

SERVER_PORT=3000 

MODE=DEV

DB_HOST=127.0.0.1

DB_PORT=

DB_USERNAME=root

DB_PASSWORD=

DB_DATABASE=clinestetic

DB_SYNCHRONIZE=true


- A app não está configurada para criar seu banco de dados. Apenas para criar as tabelas num banco já existente. Antes de executar os comandos de "start" indicados nesse readme abaixo, acesse seu SGBD (mysql, postgree, oracle etc) e crie o banco de dados.

- Como sugestão de nome "clinestetic" no arquivo .env

OBS.: Caso seja necessário a aplicação irá pedir para instalar e configurar o driver se sei SGBD.
## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

utilizado como base para desenvolvimento dessa app inicial.

## Installation (ao clonar o repositório deve executar esse comando para baixar todas as dependencias, ele vai criar uma pasta "node_modules" para sua app)

```bash
$ npm install
```

## Running the app

```bash
# development - modo de inicialização padrão da app.
$ npm run start

# watch mode - esse modo lhe permite fazer alterações em seus arquivo e salvar sem que precise derrubar a app
$ npm run start:dev

# production mode - quando enviar para produção
$ npm run start:prod
```

## Test - Temo um teste já pronto para servir de base para a implementação dos demais.

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage - mostra a cobertura de linhas e arquivos de sua aplicação
$ npm run test:cov
```
Obs.: Para rodar o exeplo de teste já funcional dessa aplicação, execute o comando de teste e passe o nome do arquivo de teste. Como o modelo abaixo:

```bash
npm run test app.controller.spec.ts


## Support

Clinistetic é um projeto inicial para o segmento de clinica de estética com pretenção de ser escalável e se tornar uma rede de do tipo GDS. Para maiores informações entre em contato com a equipe[NITECH](https://nitechacademy.com.br/) o laboratório online de software e tecnologias.


## License

  Clinestetic [Nitech corporation](https://nitechacademy.com.br/).

## swagger - Apos executar o projeto use essa interface amigável para testar sua app

http://localhost:3000/api

## Collections para o Postman - outra maneira de testar sua app com o Postman

 Basta importar  o arquivo na raiz do projeto "TesteNest.postman_collection.json"