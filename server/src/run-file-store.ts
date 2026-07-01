import type { RunVirtualFile, RunVirtualFileContent } from '../../shared/agent-contracts';

interface StoredRunFile {
  readonly path: string;
  readonly content: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
}

interface StoredRun {
  readonly files: ReadonlyMap<string, StoredRunFile>;
  readonly expiresAt: number;
}

interface RunFilesRegistration {
  readonly rawResult: unknown;
  readonly virtualFiles: readonly RunVirtualFile[];
}

const runFileStore = new Map<string, StoredRun>();
const runFileTtlMs = 30 * 60 * 1000;

export function registerRunFiles(runId: string, rawResult: unknown): RunFilesRegistration {
  cleanupExpiredRuns();

  const files = extractVirtualFiles(rawResult);
  if (files.length === 0) {
    return {
      rawResult,
      virtualFiles: [],
    };
  }

  runFileStore.set(runId, {
    files: new Map(files.map((file) => [file.path, file])),
    expiresAt: Date.now() + runFileTtlMs,
  });

  return {
    rawResult: omitFilesFromResult(rawResult),
    virtualFiles: files.map(({ path, sizeBytes, mimeType }) => ({
      path,
      sizeBytes,
      mimeType,
    })),
  };
}

export function readRunFile(runId: string, path: string): RunVirtualFileContent | null {
  cleanupExpiredRuns();

  const run = runFileStore.get(runId);
  const file = run?.files.get(path);

  if (!file) {
    return null;
  }

  return {
    runId,
    path: file.path,
    content: file.content,
    mimeType: file.mimeType,
    sizeBytes: file.sizeBytes,
  };
}

function extractVirtualFiles(rawResult: unknown): readonly StoredRunFile[] {
  const files = asRecord(rawResult)?.['files'];
  const fileEntries = asRecord(files);

  if (!fileEntries) {
    return [];
  }

  return Object.entries(fileEntries)
    .map(([path, fileData]) => normalizeFile(path, fileData))
    .filter((file): file is StoredRunFile => file !== null);
}

function normalizeFile(path: string, fileData: unknown): StoredRunFile | null {
  const record = asRecord(fileData);

  if (!record) {
    return null;
  }

  const content = record?.['content'];

  if (typeof content === 'string') {
    return {
      path,
      content,
      mimeType: getMimeType(record),
      sizeBytes: byteLength(content),
    };
  }

  if (Array.isArray(content) && content.every((line) => typeof line === 'string')) {
    const joinedContent = content.join('\n');

    return {
      path,
      content: joinedContent,
      mimeType: getMimeType(record),
      sizeBytes: byteLength(joinedContent),
    };
  }

  return null;
}

function getMimeType(fileData: Record<string, unknown>): string {
  const mimeType = fileData['mimeType'];
  return typeof mimeType === 'string' ? mimeType : 'text/plain';
}

function omitFilesFromResult(rawResult: unknown): unknown {
  const record = asRecord(rawResult);

  if (!record || !('files' in record)) {
    return rawResult;
  }

  const { files: _files, ...resultWithoutFiles } = record;
  return resultWithoutFiles;
}

function cleanupExpiredRuns(): void {
  const now = Date.now();

  for (const [runId, run] of runFileStore) {
    if (run.expiresAt <= now) {
      runFileStore.delete(runId);
    }
  }
}

function byteLength(content: string): number {
  return new TextEncoder().encode(content).byteLength;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}
