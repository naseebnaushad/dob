# Dob: the Docker Builder

A VS Code extension that runs `docker build` for you from saved profiles — no more remembering which `-f`, `-t`, or `--build-arg` flags go with which environment.

## Why

Teams that ship the same service to multiple countries/regions often end up with one Dockerfile per environment (different timezone, config, etc.) and a `docker build -f ... -t ...` command that has to be typed correctly by hand every time. This extension lets you save each environment as a small JSON "profile" once, then build from it with a single command or keyboard shortcut.

## Usage

1. Add a `.docker-profiles/` folder to your workspace root (or point `dockerBuilder.profilesPath` at a different folder).
2. Add one `*.json` file per environment (see schema below).
3. Run **Dob: Build from Profile** from the Command Palette, or press `Cmd+Alt+B` / `Ctrl+Alt+B`.
4. Pick a profile from the list.
5. Fill in any prompted fields (e.g. version tag) — leave blank to use the profile's default.
6. If Docker isn't running, the extension launches Docker Desktop for you and waits for it to come up (up to 90s) before continuing — on Linux, where Docker usually runs as a system service, it just tells you to start it.
7. The extension runs the resulting `docker build` command in an integrated terminal named **Docker Builder**, so you see full build output live.

## Profile schema

```json
{
  "name": "UAE",
  "dockerfilePath": "dockerfiles/uae/Dockerfile",
  "context": ".",
  "imageName": "example/my-service",
  "platform": "linux/amd64",
  "buildArgs": { "TZ": "Asia/Dubai" },
  "promptFields": [
    { "key": "tag", "label": "Version tag", "default": "latest" }
  ]
}
```

| Field | Required | Description |
|---|---|---|
| `name` | yes | Shown in the profile picker. |
| `dockerfilePath` | yes | Path to the Dockerfile, relative to the workspace root. |
| `imageName` | yes | Image name (without tag). |
| `context` | no | Build context passed to `docker build`. Defaults to `.`. |
| `platform` | no | Passed as `--platform`. |
| `buildArgs` | no | Object of `KEY: value` pairs, passed as `--build-arg KEY=value`. |
| `promptFields` | no | Fields the extension always asks for, each with a `default` used when left blank. The field with `key: "tag"` becomes the image tag; any others are informational for now. |

An example profile lives in [`examples/.docker-profiles/example-country.json`](examples/.docker-profiles/example-country.json).

## Settings

- `dockerBuilder.profilesPath` — folder (relative to the workspace root) containing the profile JSON files. Default: `.docker-profiles`.

## Roadmap

- `docker push` after a successful build, using a registry defined on the profile.
- Multi-arch builds via `docker buildx`.

## Development

```bash
npm install
npm run compile
```

Press `F5` in VS Code to launch an Extension Development Host with the extension loaded, then open a workspace containing a `.docker-profiles/` folder to try it.

To build a distributable package:

```bash
npm run package
```

This produces a `.vsix` file you can install via **Extensions → Install from VSIX...**.

## License

MIT — see [LICENSE](LICENSE).
