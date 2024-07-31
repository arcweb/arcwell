## Steps made to setup Angular and Material

After starting a new angular project the following steps were taken to install Material UI and set up themeing for the Material v3 design system:

- ran `ng add @angular/material`
- selected a Material v3 theme as well as imported animations
- ran the following schematic with Arcweb blue color `ng generate @angular/material:m3-theme` and added the output to the `styles/_theme.scss` file
- in the styles.scss file, added the following:

```
  @include mat.core();


  html {
    @include mat.core-theme(theme.$light-theme);
    @include mat.all-component-themes(theme.$light-theme);
    @include mat.system-level-colors(theme.$light-theme);  // required for references to system level colors such as 'on-primary'
    @include mat.system-level-typography(theme.$light-theme);
    @include mat.strong-focus-indicators(theme.$light-theme); // accessibility

    //custom, component level mixins
    @include mixins.button-theme(theme.$light-theme);
    @include mixins.toolbar-theme(theme.$light-theme);
  }
```

- added `_toolbar.scss` and `_button.scss` as examples for the mixin folder structure and variable references
- make sure to reference theme colors when possible using system level variables, refer to the `_toolbar.scss` file for how to do this.
- please check out the following 2 guides for more information no themeing material with v3 of their design spec:
  - https://angular-material.dev/articles/angular-material-theming-css-vars
  - https://material.angular.io/guide/theming
- note that the component api for adding the `color` attribute to material components does not work with Material v3. We need to create custom classes to theme components. Always do this at a mixin level and not a component level when adding a style which will apply to multiple components.

### Steps made to setup EsLint, StyleLint and Prettier
  The admin package has added Eslint and Stylelint for linting typescript and scss respectively.  In addition Prettier has been added for code formatting for both file types.  The configuration and version of these packages is independent / not coupled with the configuration and versions of any other package in this monorepo.

#### Requirements
- Eslint requires the `.eslintrc.json` file to be in the root of the admin package
- Stylelint requires the `.stylelintrc.json` file to be in the root of the admin package
- Prettier requires the `.prettierrc.json` file to be in the root of the admin package
- run `npm install` to install packages/plugins for these three libraries
- Please refer to the scripts portion of the `admin/package.json` file for running the scripts for linting / fixing errors in this package
- In order to autoformat the typescript and scss files in this package based on the configuration files listed above, your IDE needs to be configured to do so.  Here are the recommended plugins for VSCode:
> - [Eslint Plugin](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
> - [Stylelint Plugin](https://marketplace.visualstudio.com/items?itemName=stylelint.vscode-stylelint)
> - [Prettier Plugin](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

- Here is an example configuration for vscode, please look up the documentation on how to enable autoformatting on save in your IDE of choice:
```
{
  "typescript.tsdk": "./node_modules/typescript/lib",
  "eslint.workingDirectories": [
    { "directory": "./packages/admin", "changeProcessCWD": true },
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
  "stylelint.validate": [
    "css",
    "scss"
  ],
  "eslint.format.enable": true,
  "editor.formatOnSave": true,
  "eslint.useFlatConfig": false,
  "prettier.requireConfig": true,
  "eslint.validate": [
    "javascript",
    "typescript",
    "angular",
  ],
}