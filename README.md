# 轻书架 (light_novel_shelf)

A Online Novel Reading Project

## node version manager

[nvm-windows](https://github.com/coreybutler/nvm-windows) for window, [nvm](https://github.com/nvm-sh/nvm) for \*nix

> use [nvm-window@1.1.7](https://github.com/coreybutler/nvm-windows/releases/tag/1.1.7) or [do this after install](https://github.com/coreybutler/nvm-windows/wiki/Common-Issues#permissions-exit-1-exit-5-access-denied-exit-145)

> github issue: [exit status 1: Access is denied](https://github.com/coreybutler/nvm-windows/issues/717)

### switch node version

`nvm on` on window and `nvm use` on \*nix

## Install the dependencies

```bash
npm ci
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
quasar dev
```

### Lint the files

```bash
npm run lint
```

### Format the files

```bash
npm run format
```

### Build the app for production

```bash
quasar build
```

### icon

[Icônes](https://icones.js.org/)

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js).

### Install electron behind proxy

`cross-env ELECTRON_GET_USE_PROXY=1 GLOBAL_AGENT_HTTPS_PROXY=http://127.0.0.1:114514 npm ci`

See [Advanced Installation Instructions](https://www.electronjs.org/docs/latest/tutorial/installation/#proxies).
