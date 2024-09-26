# Ui

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.0.7.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Added eslint and prettier with schematics

** WORK IN PROGRESS **

```
ng add @angular-eslint/schematics@18
```

```
npm install --save-dev --save-exact eslint-plugin-prettier eslint-config-prettier
npm install --save-dev --save-exact prettier
```

Added

```
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

...

eslintPluginPrettierRecommended,
],
rules: {
  "prettier/prettier": [
    "error",
    {
      "parser": "angular"
    },
  ]
},

```

## JetBrains IDE Configurations

For IDE to recognize signalstore exposed signals, enable proper typescript highlighting of signalStore

- Settings > Languages & Frameworks > TypeScript > Angular > WebStorm Angular TypeScript Plugin > Auto

## VSCODE IDE Eslint, Prettier and Stylelint configuration

The admin Angular application is configured to use EsLint, Prettier and Stylelint for code styling and linting. For developers using VSCode, there are 3 plugins required:

1. Name: Prettier - Code formatter\
   Id: esbenp.prettier-vscode\
   Description: Code formatter using prettier\
   Publisher: Prettier\
   VS Marketplace Link: https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode

2. Name: ESLint\
   Id: dbaeumer.vscode-eslint\
   Description: Integrates ESLint JavaScript into VS Code.\
   Publisher: Microsoft\
   VS Marketplace Link: https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint

3. Name: Stylelint\
   Id: stylelint.vscode-stylelint\
   Description: Official Stylelint extension for Visual Studio Code\
   Publisher: Stylelint\
   VS Marketplace Link: https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint

You may also have to update your User `settings.json` by pressing `F1` and selecting `Preferences: Open User Settings`. Here is an example configuration to add to your existing user settings. This will enable formatting on save among other things:

```json
{
  "eslint.workingDirectories": [
    { "directory": "./packages/admin", "changeProcessCWD": true }
  ],
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit"
    },
    "editor.formatOnSave": true
  },
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit"
    },
    "editor.formatOnSave": true
  },
  "[scss]": {
    "editor.defaultFormatter": "stylelint.vscode-stylelint",
    "editor.codeActionsOnSave": {
      "source.fixAll.stylelint": "explicit"
    },
    "editor.formatOnSave": true
  },
  "stylelint.validate": ["css", "scss"],
  "eslint.format.enable": true,
  "editor.formatOnSave": true,
  "eslint.useFlatConfig": true,
  "prettier.requireConfig": true,
  "eslint.validate": ["javascript", "typescript", "angular"],
  "[jsonc]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```
