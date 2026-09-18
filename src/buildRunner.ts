import * as vscode from "vscode";
import { Profile } from "./profiles";

/** Wraps a value in single quotes for safe use as a shell argument. */
function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

export function buildCommand(profile: Profile, fieldValues: Record<string, string>, workspaceRoot: string): string {
  const parts = ["docker", "build"];

  if (profile.platform) {
    parts.push("--platform", shellQuote(profile.platform));
  }

  parts.push("-f", shellQuote(profile.dockerfilePath));

  const tag = fieldValues["tag"] ?? "latest";
  parts.push("-t", shellQuote(`${profile.imageName}:${tag}`));

  for (const [key, value] of Object.entries(profile.buildArgs ?? {})) {
    parts.push("--build-arg", shellQuote(`${key}=${value}`));
  }

  parts.push(shellQuote(profile.context));

  return parts.join(" ");
}

let terminal: vscode.Terminal | undefined;

function getTerminal(): vscode.Terminal {
  if (!terminal || terminal.exitStatus !== undefined) {
    terminal = vscode.window.createTerminal("Docker Builder");
  }
  return terminal;
}

export function runBuild(profile: Profile, fieldValues: Record<string, string>, workspaceRoot: string): void {
  const command = buildCommand(profile, fieldValues, workspaceRoot);
  const term = getTerminal();
  term.show();
  term.sendText(`cd ${shellQuote(workspaceRoot)} && ${command}`);
}
