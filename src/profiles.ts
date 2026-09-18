import * as fs from "fs";
import * as path from "path";

export interface PromptField {
  key: string;
  label: string;
  default: string;
}

export interface Profile {
  name: string;
  dockerfilePath: string;
  context: string;
  imageName: string;
  platform?: string;
  buildArgs?: Record<string, string>;
  promptFields?: PromptField[];
  /** Absolute path to the profile's own JSON file, for error messages. */
  sourceFile: string;
}

export interface LoadResult {
  profiles: Profile[];
  errors: string[];
}

function isValidProfile(data: any): data is Omit<Profile, "sourceFile"> {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof data.name === "string" &&
    typeof data.dockerfilePath === "string" &&
    typeof data.imageName === "string"
  );
}

export function loadProfiles(workspaceRoot: string, profilesPath: string): LoadResult {
  const dir = path.resolve(workspaceRoot, profilesPath);
  const profiles: Profile[] = [];
  const errors: string[] = [];

  let files: string[];
  try {
    files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".json"));
  } catch {
    errors.push(`Profiles folder not found: ${dir}`);
    return { profiles, errors };
  }

  for (const file of files) {
    const fullPath = path.join(dir, file);
    try {
      const raw = fs.readFileSync(fullPath, "utf8");
      const data = JSON.parse(raw);
      if (!isValidProfile(data)) {
        errors.push(`${file}: missing required fields (name, dockerfilePath, imageName)`);
        continue;
      }
      profiles.push({
        ...data,
        context: data.context ?? ".",
        sourceFile: fullPath,
      });
    } catch (err: any) {
      errors.push(`${file}: ${err.message ?? "invalid JSON"}`);
    }
  }

  return { profiles, errors };
}
