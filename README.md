# cpycnf

> Define recurring file copy tasks in a config and execute them.

## Usage

### Global

```sh
npm install cpycnf --global
```
```sh
$ cpycnf
```

### Local

```sh
npm install cpycnf [--save-dev]
```

```sh
$ npx cpycnf
```

Add to `package.json`

```json
{
  "name": "my-package",
  "scripts": {
    "copy": "cpycnf"
  }
}
```

## Configuration

Add the `cpycnf` config to your `package.json` or a dedicated config file: `.cpycnfrc.{json,js,cjs}`, `.config/cpycnfrc`, `.config/cpycnfrc.{json,js,cjs}`, `cpycnf.config.{js,cjs}`

### Example

*One-to-one applicable to all `.json` config files.*

```json
{
  "tasks": [
    ["node_modules/jquery/dist/jquery.min.*", "public/jquery"],
    [
      [
        "node_modules/bootstrap/dist/js/bootstrap.bundle.min.*",
        "node_modules/bootstrap/dist/css/bootstrap.min.*"
      ], "public/bootstrap", { "flat": true }
    ]
  ]
}
```

Every task in the `tasks` array consists of an array with a fixed structure:
```ts
type Task = [source: string | string[], destination: string, options: Options]
```
Under the hood `cpycnf` uses [cpy](https://github.com/sindresorhus/cpy#api).
Head over to [cpy#options](https://github.com/sindresorhus/cpy#options) for the options reference.

### Example package.json

```json
{
  "name": "my-package",
  // ...
  "cpycnf": {
    "tasks": [
      // ...
    ]
  }
}
```

### Example .js, .cjs

```js
module.exports = {
  tasks: [
    // ...
  ]
}
```