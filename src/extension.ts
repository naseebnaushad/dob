import * as vscode from "vscode";
import { loadProfiles, Profile } from "./profiles";
import { runBuild } from "./buildRunner";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand("dockerBuilder.buildFromProfile", async () => {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      vscode.window.showErrorMessage("Docker Builder: open a workspace folder first.");
      return;
    }
    const workspaceRoot = workspaceFolder.uri.fsPath;

    const profilesPath = vscode.workspace
      .getConfiguration("dockerBuilder")
      .get<string>("profilesPath", ".docker-profiles");

    const { profiles, errors } = loadProfiles(workspaceRoot, profilesPath);

    for (const error of errors) {
      vscode.window.showErrorMessage(`Docker Builder: ${error}`);
    }

    if (profiles.length === 0) {
      vscode.window.showErrorMessage(
        `Docker Builder: no valid profiles found in "${profilesPath}". Add a *.json profile there first.`
      );
      return;
    }

    const picked = await vscode.window.showQuickPick(
      profiles.map((profile) => ({
        label: profile.name,
        description: profile.dockerfilePath,
        profile,
      })),
      { placeHolder: "Select a build profile" }
    );
    if (!picked) {
      return;
    }

    const fieldValues = await promptForFields(picked.profile);
    if (fieldValues === undefined) {
      return;
    }

    runBuild(picked.profile, fieldValues, workspaceRoot);
  });

  context.subscriptions.push(disposable);
}

async function promptForFields(profile: Profile): Promise<Record<string, string> | undefined> {
  const values: Record<string, string> = {};
  for (const field of profile.promptFields ?? []) {
    const input = await vscode.window.showInputBox({
      prompt: field.label,
      placeHolder: `Default: ${field.default}`,
    });
    if (input === undefined) {
      return undefined;
    }
    values[field.key] = input.trim() === "" ? field.default : input.trim();
  }
  return values;
}

export function deactivate() {}
