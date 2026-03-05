import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { log } from '@packages/utils';

const gitRoot = execSync('git rev-parse --show-toplevel').toString('utf-8').trim();
const gitPath = path.join(gitRoot, '.git');

const mergeMsgPath = path.join(gitPath, 'MERGE_MSG');

if (fs.existsSync(mergeMsgPath)) {
  process.exit(0);
}

const commitMsgPath = path.join(gitPath, 'COMMIT_EDITMSG');
const commitMessage = fs.readFileSync(commitMsgPath, 'utf8').trim();

const branchName = execSync('git rev-parse --abbrev-ref HEAD').toString('utf8').trim();

const matchResult = branchName.match(/[A-Z]{2,5}-[0-9]{1,9}/);

if (!matchResult) {
  log.warning('Invalid branch name. Skipped');
  process.exit(0);
}

const taskNumber = matchResult[0].toUpperCase();

// Проверяем различные форматы в начале сообщения:
// 1. "TEST-1201: сообщение"
// 2. "[TEST-1201] сообщение"
// 3. "(TEST-1201) сообщение"
// 4. "TEST-1201 сообщение" (без двоеточия)
// 5. "fix/TEST-1201: сообщение"
const patterns = [
  new RegExp(`^\\s*${taskNumber}\\s*:\\s*`, 'i'),
  new RegExp(`^\s*\[\s*${taskNumber}\s*]\s*`, 'i'),
  new RegExp(`^\\s*\\(\\s*${taskNumber}\\s*\\)\\s*`, 'i'),
  new RegExp(`^\\s*${taskNumber}\\s+`, 'i'),
  new RegExp(`^\\s*[a-z]+\\s*/\\s*${taskNumber}\\s*:\\s*`, 'i'),
];

const startsWithTaskNumber = patterns.some((pattern) => pattern.test(commitMessage));

const containsTaskNumber = new RegExp(`\\b${taskNumber}\\b`, 'i').test(commitMessage);

if (startsWithTaskNumber || containsTaskNumber) {
  log.info(`Commit message already contains ${taskNumber}. Skipped`);
  process.exit(0);
}

const conventionalPrefixRegex = /^\s*(feat|fix|docs|style|refactor|http|chore|perf|build|ci|revert)(\([^)]+\))?!?:\s*/i;
const match = commitMessage.match(conventionalPrefixRegex);

let newCommitMessage: string;

if (match) {
  const prefix = match[0];
  const restOfMessage = commitMessage.slice(prefix.length);

  newCommitMessage = `${prefix}${taskNumber}: ${restOfMessage}`;
} else {
  newCommitMessage = `${taskNumber}: ${commitMessage}`;
}

fs.writeFileSync(commitMsgPath, newCommitMessage, 'utf8');
log.info(`Added ${taskNumber} to commit message`);
