# Built-In Tools

Deep Agents include harness tools even when the application only passes its own custom tools.

These notes explain the built-in tools in plain language.

## Core Harness Tools

- [ ] `ls` - List files in a directory.
- [x] [`read_file`](./read-file.md) - Read file contents with pagination and multimodal support.
- [ ] `write_file` - Create or overwrite files.
- [ ] `edit_file` - Perform exact string replacements in files.
- [ ] `glob` - Find files matching a glob pattern.
- [ ] `grep` - Search file contents.
- [ ] `execute` - Run shell commands when the backend supports execution, such as sandbox backends.
- [ ] `task` - Spawn a subagent for delegated work.
- [ ] `write_todos` - Manage a structured todo list.

## Async Subagent Tools

These tools are available when async subagents are configured.

- [ ] `start_async_task` - Start a new background task.
- [ ] `check_async_task` - Check status and retrieve the result when complete.
- [ ] `update_async_task` - Send new instructions to a running task.
- [ ] `cancel_async_task` - Stop a running task.
- [ ] `list_async_tasks` - List tracked async tasks and their statuses.

## Source Links

- [Deep Agents built-in harness tools](https://docs.langchain.com/oss/javascript/deepagents/tools#built-in-harness-tools)
- [Deep Agents virtual filesystem access](https://docs.langchain.com/oss/javascript/deepagents/overview#virtual-filesystem-access)
- [Deep Agents context compression and offloading](https://docs.langchain.com/oss/javascript/deepagents/context-engineering#offloading)
- [Deep Agents async subagents](https://docs.langchain.com/oss/javascript/deepagents/async-subagents)
