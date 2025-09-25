export default {
  branches: ["master"],
  // Obsidianプラグインはgit tagにvをつけてはいけないのでtagFormatを変更
  tagFormat: "${version}",
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "conventionalcommits",
        releaseRules: [
          { breaking: true, release: "minor" }, // TODO: v1になったら release: "major" にする
          { type: "feat", release: "minor" },
          { type: "build", release: "minor" },
          { type: "style", release: "minor" },
          { type: "fix", release: "patch" },
          { type: "refactor", release: "patch" },
          { revert: true, release: "patch" },
        ],
      },
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        preset: "conventionalcommits",
        presetConfig: {
          types: [
            { type: "feat", section: "✨ Features" },
            { type: "style", section: "🎨 Styles" },
            { type: "fix", section: "🛡 Bug Fixes" },
            { type: "build", section: "🤖 Build" },
            { type: "docs", hidden: true },
            { type: "refactor", hidden: true },
            { type: "test", hidden: true },
            { type: "ci", hidden: true },
            { type: "dev", hidden: true },
            { type: "chore", hidden: true },
          ],
        },
      },
    ],
    [
      "@semantic-release/exec",
      {
        // リリース作業直前にCIでビルド・テストを行い、version-bump.mtsでバージョン更新処理を行う. ${nextRelease.version}はsemantic-releaseが決めたバージョン
        prepareCmd: "bun run ci && bun version-bump.mts ${nextRelease.version}",
      },
    ],
    [
      "@semantic-release/github",
      {
        // Obsidianプラグインとして配布する必要のあるファイルを記載
        assets: [
          "main.js",
          "styles.css",
          "manifest.json",
          "manifest-beta.json",
        ],
      },
    ],
    [
      "@semantic-release/git",
      {
        // bun version-bump.mts で変更されたファイルすべてをコミット対象とする
        assets: [
          "package.json",
          "manifest-beta.json",
          "manifest.json",
          "versions.json",
          "bun.lockb",
        ],
        message:
          "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
      },
    ],
  ],
};
