#!/usr/bin/env bun
import { readFileSync } from "node:fs";

const decoder = new TextDecoder();
const execEnv = { ...Bun.env };
delete execEnv.GITHUB_TOKEN;

type ExecOptions = {
  allowFailure?: boolean;
};

type RepoInfo = {
  owner: string;
  name: string;
};

type ReleaseInfo = {
  tagName: string;
  name: string | null;
  publishedAt: string | null;
  body: string | null;
  url: string;
};

type WorkflowRun = {
  id: number;
  status: string;
  conclusion: string | null;
  created_at: string;
  updated_at: string;
  html_url: string;
  head_sha: string;
  head_branch: string;
};

async function exec(command: string[], options: ExecOptions = {}) {
  const result = Bun.spawnSync({
    cmd: command,
    stdout: "pipe",
    stderr: "pipe",
    env: execEnv,
  });
  const stdout = decoder.decode(result.stdout ?? new Uint8Array());
  const stderr = decoder.decode(result.stderr ?? new Uint8Array());
  if (result.exitCode !== 0 && !options.allowFailure) {
    throw new Error(
      `コマンド実行に失敗しました: ${command.join(" ")}\n${stderr || stdout}`,
    );
  }
  return { stdout, stderr, exitCode: result.exitCode } as const;
}

function parseRepo(url: string): RepoInfo {
  if (url.startsWith("git@")) {
    const match = url.match(/git@[^:]+:([^/]+)\/(.+)\.git/);
    if (match) {
      return { owner: match[1], name: match[2] };
    }
  }
  if (url.startsWith("https://") || url.startsWith("http://")) {
    const match = url.match(/https?:\/\/[^/]+\/([^/]+)\/(.+)\.git/);
    if (match) {
      return { owner: match[1], name: match[2] };
    }
  }
  throw new Error(`GitリモートURLからowner/repoを判別できませんでした: ${url}`);
}

async function ensureNoUnpushedCommits(branch: string) {
  await exec(["git", "fetch", "--prune"]);
  const upstreamResult = await exec(
    ["git", "rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"],
    { allowFailure: true },
  );
  if (upstreamResult.exitCode !== 0) {
    throw new Error(
      "トラッキングブランチが設定されていません。`git push -u origin <branch>` を先に実行してください。",
    );
  }
  const upstream = upstreamResult.stdout.trim();
  const aheadInfo = await exec([
    "git",
    "rev-list",
    "--left-right",
    "--count",
    `${upstream}...HEAD`,
  ]);
  const [behindRaw, aheadRaw] = aheadInfo.stdout.trim().split(/\s+/);
  const ahead = Number(aheadRaw ?? "0");
  if (Number.isNaN(ahead)) {
    throw new Error(`未pushコミット数の取得に失敗しました: ${aheadInfo.stdout}`);
  }
  if (ahead > 0) {
    throw new Error(
      `未pushのコミットが ${ahead} 件あります。push を完了してから再実行してください。`,
    );
  }
  const behind = Number(behindRaw ?? "0");
  if (behind > 0) {
    console.log(
      `ℹ️  リモートに ${behind} 件の新しいコミットがあります。後ほど pull で取り込みます。`,
    );
  }
  console.log("✅ 未pushコミットはありません。");
}

async function ensureCiSuccess(repo: RepoInfo, branch: string) {
  console.log("🔍 Testsワークフローの最新結果を確認します...");
  const { stdout } = await exec([
    "gh",
    "api",
    `repos/${repo.owner}/${repo.name}/actions/workflows/tests.yaml/runs`,
    "--method",
    "GET",
    "-F",
    `branch=${branch}`,
    "-F",
    "per_page=5",
  ]);
  const runs = JSON.parse(stdout).workflow_runs as WorkflowRun[] | undefined;
  if (!runs || runs.length === 0) {
    throw new Error("Testsワークフローの実行履歴が見つかりません。");
  }
  const latest = runs.find((run) => run.head_branch === branch) ?? runs[0];
  if (latest.status !== "completed") {
    throw new Error(
      `Testsワークフローが完了していません (status: ${latest.status})。完了を待ってください。`,
    );
  }
  if (latest.conclusion !== "success") {
    throw new Error(
      `Testsワークフローが成功していません (conclusion: ${latest.conclusion ?? "unknown"})。`,
    );
  }
  console.log("✅ Testsワークフローの最新実行は成功しています。");
}

async function ensureNoRunningRelease(repo: RepoInfo) {
  const { stdout } = await exec([
    "gh",
    "api",
    `repos/${repo.owner}/${repo.name}/actions/workflows/release.yaml/runs`,
    "--method",
    "GET",
    "-F",
    "per_page=5",
  ]);
  const runs = JSON.parse(stdout).workflow_runs as WorkflowRun[] | undefined;
  if (!runs) {
    return;
  }
  const running = runs.find((run) => run.status === "queued" || run.status === "in_progress");
  if (running) {
    throw new Error(
      `Releaseワークフロー (run_id: ${running.id}) が進行中です。完了後に再実行してください。`,
    );
  }
}

async function triggerReleaseWorkflow(repo: RepoInfo, branch: string) {
  console.log("🚀 Releaseワークフローを実行します...");
  await ensureNoRunningRelease(repo);
  const dispatchTime = new Date();
  await exec([
    "gh",
    "api",
    `repos/${repo.owner}/${repo.name}/actions/workflows/release.yaml/dispatches`,
    "-X",
    "POST",
    "-F",
    `ref=${branch}`,
  ]);
  const runId = await waitForNewReleaseRun(repo, dispatchTime);
  console.log(`ℹ️  Releaseワークフロー run_id=${runId} を検知しました。`);
  await waitForRunCompletion(repo, runId);
}

async function waitForNewReleaseRun(repo: RepoInfo, since: Date) {
  const deadline = Date.now() + 5 * 60 * 1000;
  while (Date.now() < deadline) {
    const { stdout } = await exec([
      "gh",
      "api",
      `repos/${repo.owner}/${repo.name}/actions/workflows/release.yaml/runs`,
      "--method",
      "GET",
      "-F",
      "per_page=5",
    ]);
    const runs = JSON.parse(stdout).workflow_runs as WorkflowRun[] | undefined;
    if (runs && runs.length > 0) {
      const run = runs.find((item) => {
        const createdAt = new Date(item.created_at).getTime();
        return createdAt >= since.getTime() - 10_000;
      });
      if (run) {
        return run.id;
      }
    }
    await Bun.sleep(5000);
  }
  throw new Error("Releaseワークフローの新規実行を検出できませんでした。");
}

async function waitForRunCompletion(repo: RepoInfo, runId: number) {
  const deadline = Date.now() + 60 * 60 * 1000;
  while (Date.now() < deadline) {
    const { stdout } = await exec([
      "gh",
      "api",
      `repos/${repo.owner}/${repo.name}/actions/runs/${runId}`,
    ]);
    const run: WorkflowRun = JSON.parse(stdout);
    if (run.status === "completed") {
      if (run.conclusion !== "success") {
        throw new Error(
          `Releaseワークフローが失敗しました (conclusion: ${run.conclusion ?? "unknown"})。`,
        );
      }
      console.log("✅ Releaseワークフローが正常終了しました。");
      return;
    }
    console.log(
      `⏳ Releaseワークフロー実行中... status=${run.status}, updated_at=${run.updated_at}`,
    );
    await Bun.sleep(10_000);
  }
  throw new Error("Releaseワークフローの完了待機がタイムアウトしました。");
}

async function fetchLatestRelease(repo: RepoInfo): Promise<ReleaseInfo | null> {
  const { stdout } = await exec([
    "gh",
    "release",
    "list",
    "--limit",
    "1",
    "--json",
    "tagName,publishedAt,name",
  ]);
  const releases = JSON.parse(stdout) as Array<{
    tagName: string;
    publishedAt: string | null;
    name: string | null;
  }>;
  if (!releases || releases.length === 0) {
    return null;
  }
  const latestMeta = releases[0];
  const viewResult = await exec([
    "gh",
    "release",
    "view",
    latestMeta.tagName,
    "--json",
    "body,tagName,name,publishedAt",
  ]);
  const viewJson = JSON.parse(viewResult.stdout) as {
    body: string | null;
    tagName: string;
    name: string | null;
    publishedAt: string | null;
  };
  return {
    tagName: viewJson.tagName,
    name: viewJson.name,
    publishedAt: viewJson.publishedAt,
    body: viewJson.body,
    url: `https://github.com/${repo.owner}/${repo.name}/releases/tag/${encodeURIComponent(viewJson.tagName)}`,
  };
}

async function waitForNewRelease(
  repo: RepoInfo,
  previous: ReleaseInfo | null,
  startedAt: Date,
): Promise<ReleaseInfo> {
  const previousTag = previous?.tagName ?? null;
  const deadline = Date.now() + 30 * 60 * 1000;
  while (Date.now() < deadline) {
    const latest = await fetchLatestRelease(repo);
    if (latest) {
      if (previousTag && latest.tagName !== previousTag) {
        console.log(`✅ 新しいリリース ${latest.tagName} を確認しました。`);
        return latest;
      }
      if (!previousTag) {
        const publishedAt = latest.publishedAt ? new Date(latest.publishedAt) : null;
        if (!publishedAt || publishedAt.getTime() >= startedAt.getTime() - 60_000) {
          console.log(`✅ 初回リリース ${latest.tagName} を確認しました。`);
          return latest;
        }
      }
    }
    console.log("⏳ GitHubリリースページを確認中...");
    await Bun.sleep(10_000);
  }
  throw new Error("新しいリリースが作成されませんでした。GitHub上でステータスを確認してください。");
}

function extractIssueNumbers(body: string | null): number[] {
  if (!body) {
    return [];
  }
  const matches = body.match(/#(\d+)/g);
  if (!matches) {
    return [];
  }
  const numbers = matches.map((m) => Number(m.slice(1))).filter((n) => !Number.isNaN(n));
  return Array.from(new Set(numbers));
}

async function collectIssueParticipants(repo: RepoInfo, issueNumber: number) {
  const { stdout: issueStdout } = await exec([
    "gh",
    "api",
    `repos/${repo.owner}/${repo.name}/issues/${issueNumber}`,
  ]);
  const issue = JSON.parse(issueStdout) as {
    user?: { login?: string };
    pull_request?: unknown;
  };
  if (issue.pull_request) {
    return { isPullRequest: true, participants: [] as string[] };
  }
  const participants = new Set<string>();
  if (issue.user?.login) {
    participants.add(issue.user.login);
  }
  const { stdout: commentsStdout } = await exec([
    "gh",
    "api",
    `repos/${repo.owner}/${repo.name}/issues/${issueNumber}/comments`,
    "--method",
    "GET",
    "-F",
    "per_page=100",
  ]);
  const comments = JSON.parse(commentsStdout) as Array<{ user?: { login?: string } }>;
  for (const comment of comments) {
    if (comment.user?.login) {
      participants.add(comment.user.login);
    }
  }
  return { isPullRequest: false, participants: Array.from(participants) };
}

async function notifyIssues(repo: RepoInfo, release: ReleaseInfo) {
  const issueNumbers = extractIssueNumbers(release.body);
  if (issueNumbers.length === 0) {
    console.log("ℹ️  リリースノートに関連Issue番号は見つかりませんでした。");
    return;
  }
  console.log(`🗒  関連Issue(${issueNumbers.join(", ")})へコメントします。`);
  for (const issueNumber of issueNumbers) {
    try {
      const { isPullRequest, participants } = await collectIssueParticipants(repo, issueNumber);
      if (isPullRequest) {
        console.log(`- #${issueNumber} はPull Requestのためスキップします。`);
        continue;
      }
      if (participants.length === 0) {
        console.log(`- #${issueNumber}: メンション対象がいません。`);
      }
      const mentionLine = participants.length > 0
        ? participants.map((login) => `@${login}`).join(" ") + "\n"
        : "";
      const commentBody = `${mentionLine}Released in [${release.tagName}](${release.url}) 🚀`;
      await exec([
        "gh",
        "issue",
        "comment",
        String(issueNumber),
        "--body",
        commentBody,
      ]);
      await exec([
        "gh",
        "issue",
        "close",
        String(issueNumber),
        "--reason",
        "completed",
      ]);
      console.log(`- #${issueNumber}: コメント・クローズ完了`);
    } catch (error) {
      console.error(`- #${issueNumber}: 処理に失敗しました (${(error as Error).message})`);
      throw error;
    }
  }
}

function generateBlueskyPost(productName: string, release: ReleaseInfo) {
  const bullets = extractBullets(release.body);
  const bulletText = bullets.length > 0 ? bullets.join("\n") : "・詳細はリリースノートをご覧ください";
  return `📦 ${productName} ${release.tagName} 🚀\n\n${bulletText}\n\n${release.url}`;
}

function extractBullets(body: string | null): string[] {
  if (!body) {
    return [];
  }
  const lines = body.split(/\r?\n/);
  const bullets: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("*") || trimmed.startsWith("-")) {
      let content = trimmed.replace(/^[-*]\s+/, "");
      content = content.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1");
      content = content.replace(/\s*\(#\d+\)/g, "");
      content = content.replace(/\s*\([a-f0-9]{7,}\)$/i, "");
      content = content.trim();
      if (content.length > 0) {
        bullets.push(`・${content}`);
      }
    }
    if (bullets.length >= 5) {
      break;
    }
  }
  return bullets;
}

async function gitPull(branch: string) {
  console.log("🔄 git pull を実行してリポジトリを最新化します...");
  await exec(["git", "pull", "--ff-only", "origin", branch]);
  console.log("✅ git pull 完了");
}

async function main() {
  console.log("=== Silhouette リリース自動化 ===");
  const repoUrl = (await exec(["git", "config", "--get", "remote.origin.url"])).stdout.trim();
  const repo = parseRepo(repoUrl);
  const branch = (await exec(["git", "rev-parse", "--abbrev-ref", "HEAD"])).stdout.trim();
  await ensureNoUnpushedCommits(branch);
  await ensureCiSuccess(repo, branch);
  const previousRelease = await fetchLatestRelease(repo);
  const releaseStart = new Date();
  await triggerReleaseWorkflow(repo, branch);
  const releaseInfo = await waitForNewRelease(repo, previousRelease, releaseStart);
  await notifyIssues(repo, releaseInfo);
  const manifest = JSON.parse(readFileSync("manifest.json", "utf8")) as { name?: string };
  const productName = manifest.name ?? repo.name;
  const blueskyPost = generateBlueskyPost(productName, releaseInfo);
  console.log("\n=== Bluesky投稿案 ===");
  console.log(blueskyPost);
  console.log("=== 投稿案ここまで ===\n");
  await gitPull(branch);
  console.log("🎉 リリースフローが完了しました！");
}

main().catch((error) => {
  console.error(`❌ リリース処理中にエラーが発生しました: ${(error as Error).message}`);
  process.exit(1);
});
