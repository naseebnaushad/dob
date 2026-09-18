import * as vscode from "vscode";
import { execFile } from "child_process";

function isDockerRunning(): Promise<boolean> {
  return new Promise((resolve) => {
    execFile("docker", ["info"], { timeout: 5000 }, (error) => {
      resolve(!error);
    });
  });
}

function launchDockerDesktop(): void {
  if (process.platform === "darwin") {
    execFile("open", ["-a", "Docker"]);
  } else if (process.platform === "win32") {
    execFile("cmd", ["/c", "start", "", "Docker Desktop"]);
  }
  // On Linux, Docker usually runs as a system service already; if it's down
  // we surface the "still not running" message instead of guessing at a
  // service-manager command that may need sudo.
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Ensures the Docker daemon is reachable, launching Docker Desktop and
 * waiting for it to come up if it isn't. Returns false (after notifying the
 * user) if Docker still isn't reachable after the timeout.
 */
export async function ensureDockerRunning(): Promise<boolean> {
  if (await isDockerRunning()) {
    return true;
  }

  if (process.platform === "linux") {
    vscode.window.showErrorMessage("Docker Builder: Docker daemon isn't reachable. Start Docker and try again.");
    return false;
  }

  return vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Docker Builder: starting Docker Desktop…",
      cancellable: true,
    },
    async (_progress, token) => {
      launchDockerDesktop();

      const timeoutMs = 90_000;
      const pollIntervalMs = 2000;
      const start = Date.now();

      while (Date.now() - start < timeoutMs) {
        if (token.isCancellationRequested) {
          return false;
        }
        if (await isDockerRunning()) {
          return true;
        }
        await sleep(pollIntervalMs);
      }

      vscode.window.showErrorMessage(
        "Docker Builder: Docker Desktop didn't start within 90s. Start it manually and try again."
      );
      return false;
    }
  );
}
