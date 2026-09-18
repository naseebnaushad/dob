# Changelog

## 0.1.0

- Initial release: build from a saved profile via Command Palette or `Cmd/Ctrl+Alt+B`.
- Profiles read from `.docker-profiles/*.json` (path configurable via `dockerBuilder.profilesPath`).
- Supports Dockerfiles at any path, per-profile `platform`, `buildArgs`, and always-ask `promptFields` (e.g. version tag) with defaults.
- Automatically launches Docker Desktop (macOS/Windows) and waits for it to come up if the daemon isn't reachable when a build is triggered.
