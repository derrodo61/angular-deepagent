# read_file

`read_file` is a built-in Deep Agents filesystem tool. It lets the agent read content from the Deep Agents virtual filesystem.

It is not one of our custom application tools. In this repository, our quickstart adds `internet_search`, but Deep Agents still adds its own harness tools such as `read_file`.

## What It Does

`read_file` reads a file path from the configured Deep Agents backend and returns the content to the model.

For text files, it returns text with line numbers. For supported non-text files, the official docs say it can return multimodal content blocks, such as image, audio, video, or file blocks.

Deep Agents documentation describes it as part of the virtual filesystem tool set:

- [Virtual filesystem access](https://docs.langchain.com/oss/javascript/deepagents/overview#virtual-filesystem-access)
- [Built-in harness tools](https://docs.langchain.com/oss/javascript/deepagents/tools#built-in-harness-tools)

## Input Shape

The installed TypeScript package exposes this schema:

```json
{
  "file_path": "/large_tool_results/call_abc123.txt",
  "offset": 0,
  "limit": 100
}
```

`file_path` is required. It is the absolute path inside the Deep Agents virtual filesystem.

`offset` is optional. It is a zero-based logical line offset. `offset: 0` starts at the first line.

`limit` is optional. It is the maximum number of logical file lines to read. In the installed package, the tool-level default is `100`.

## Important: Lines Are Not Screen Lines

`limit` does not mean characters, browser rows, or visible wrapped lines.

It means logical file lines after splitting the file content on newline characters.

This matters for search results because they can be stored as large minified JSON. A minified JSON result may contain one extremely long logical line. The browser can wrap that one line across hundreds of visible rows, but Deep Agents still counts it as one line.

So a call like this can still look huge in the Run Inspector:

```json
{
  "file_path": "/large_tool_results/call_abc123.txt",
  "offset": 0,
  "limit": 80
}
```

If the file has very long lines, `80` logical lines can still be a lot of visible text.

## Why It Appears In The Quickstart

The quickstart research example can produce large tool results from `internet_search`.

Deep Agents has built-in context compression. According to the official docs, large tool inputs and results can be offloaded into the filesystem and replaced with references. The docs describe the default threshold as `20,000` tokens for offloading large tool inputs or results.

When that happens, the model sees a message like this:

```text
Tool result too large, the result of this tool call ... was saved in the filesystem at this path: /large_tool_results/...
```

The agent can then call `read_file` to inspect part of the offloaded result.

That is why we may see this sequence in the Run Inspector:

1. `internet_search`
2. `read_file`

The second call is the agent reading the offloaded result through its own filesystem tool.

## What Angular Receives

There are two separate mechanisms in our app.

The `read_file` tool result is part of the normal Deep Agents run result. If the agent called `read_file`, Angular receives that tool result inside the original `/runs` response. No extra browser request is needed.

The "Load full response" button is different. That is our own debugging feature. The backend stores top-level `rawResult.files` content in memory and removes it from the main response to keep the browser payload smaller. When the button is clicked, Angular asks our backend for the full stored virtual file.

So:

- visible `read_file` tool call result: comes from Deep Agents inside the original run response
- "Load full response" button: comes from our backend file endpoint

## Current App Implementation

The quickstart experiment creates the Deep Agent and custom `internet_search` tool here:

- [`server/src/experiments/deep-agents-quickstart.ts`](../../../../server/src/experiments/deep-agents-quickstart.ts)

The backend stores top-level virtual files for lazy UI inspection here:

- [`server/src/run-file-store.ts`](../../../../server/src/run-file-store.ts)

The Run Inspector displays tool calls and virtual files here:

- [`src/app/experiments/components/run-inspector/run-inspector.ts`](../../../../src/app/experiments/components/run-inspector/run-inspector.ts)

## Practical Debugging Notes

If there is no `read_file` tool call, the agent did not visibly use `read_file` in that run.

If there is a `read_file` tool call, expand it in the Run Inspector to see:

- which virtual file path it read
- what `offset` and `limit` it used
- what content was returned to the model

If the result is hard to read because it is minified JSON, the problem is not necessarily the line limit. The file may need formatting before line-based pagination becomes useful.
