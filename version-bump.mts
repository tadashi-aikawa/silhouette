import { readFileSync, writeFileSync } from "fs";
import { exit } from "process";

function updateVersion(version: string) {
  const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
  packageJson.version = version;
  writeFileSync("package.json", JSON.stringify(packageJson, null, "  "));

  const manifestBeta = JSON.parse(readFileSync("manifest-beta.json", "utf8"));
  manifestBeta.version = version;
  writeFileSync("manifest-beta.json", JSON.stringify(manifestBeta, null, "  "));
  if (version.includes("beta")) {
    return;
  }

  const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
  const { minAppVersion } = manifest;
  manifest.version = version;
  writeFileSync("manifest.json", JSON.stringify(manifest, null, "  "));

  // update versions.json with target version and minAppVersion from manifest.json
  let versions = JSON.parse(readFileSync("versions.json", "utf8"));
  versions[version] = minAppVersion;
  writeFileSync("versions.json", JSON.stringify(versions, null, "  "));
}

const [_1, _2, version] = Bun.argv;
if (!version) {
  console.error("Required: ${version} (ex: bun version 1.2.3)");
  exit(1);
}
if (!Boolean(version.match(/\d+\.\d+\.\d+/))) {
  console.error("The version is not valid (ex: bun version 1.2.3)");
  exit(1);
}

updateVersion(version);
