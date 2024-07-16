<img src="doc/logo.png" width="250"/>

Arcwell Digital Medicine Platform

## Overview

Arcwell is an extensible platform for modeling solutions in digital medicine
including clinical pathways, captured data including patient observations,
and powering the delivery and management of clinical trials, surveys,
assessments, questionnaires, clinical decision support systems, and more.

Arcwell itself is composed of:

- **Arcwell Server** – REST and GraphQL APIs for app integration
- **Arcwell Admin** – An administrative dashboard allowing for management and configuration
- **Arcwell Client Libraries** – SDKs for developers to leverage when integrating Arcwell in their applications
- **Embedded EHR** – FHIR-compliant electronic health record system for cache, local record, and integration with health systems

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

## Quickstart

```
docker compose up --build
```

## Additional Documentation

Documentation [further fleshed out within](./doc).

[Apache 2.0 License](./LICENSE)  
(C) 2024 Copyright Arcweb Technologies, LLC
