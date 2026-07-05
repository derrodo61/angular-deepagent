# Backends

Deep Agents expose a filesystem-like surface to the agent. Tools such as `read_file`, `write_file`, `edit_file`, `ls`, `glob`, and `grep` use this surface.

A backend decides where the files actually live.

That separation is important:

```text
tool = what the agent can ask for
backend = where the data is stored and how access works
```

So `read_file('/notes.txt')` always looks like a file read to the agent, but the content may come from temporary thread state, a real disk folder, a persistent store, or a routed mix of multiple backends.

Official docs:

- [Deep Agents backends](https://docs.langchain.com/oss/javascript/deepagents/backends)
- [Virtual filesystem access](https://docs.langchain.com/oss/javascript/deepagents/overview#virtual-filesystem-access)

## Why Backends Exist

Agents need files for different reasons.

Sometimes a file is only a scratch pad for one run. Sometimes it is a real project file on disk. Sometimes it is long-term memory that should survive future conversations. Sometimes one agent should have all of these at once.

One fixed storage strategy would force bad tradeoffs:

- If everything is temporary, the agent cannot remember useful information.
- If everything is persistent, scratch files and large tool results can pollute long-term storage.
- If everything is real disk access, a server-side agent can become unsafe.
- If everything is isolated from disk, coding and local-file workflows become impossible.

Backends solve this by keeping the agent tool interface stable while letting the application choose the storage model.

## Terms Used On This Page

A `thread` is one ongoing conversation or work session with an agent.

For example, if the same user asks a question, the agent writes `/draft.txt`, and the user then asks a follow-up question, those requests can belong to the same thread. A different conversation can use a different thread.

When something is `scoped to a thread`, it means it belongs only to that thread. Other threads do not automatically see it.

A `turn` is one step in the conversation. Usually it means one user request and the agent's response to that request. A thread contains many turns.

`Checkpointing` means saving the agent's state between turns. Without checkpointing, the app may not have a saved state to continue from later. With checkpointing, the next turn in the same thread can continue with the saved messages, files, and other state. Where that saved state lives depends on the checkpointer.

## StateBackend

`StateBackend` stores files in the agent's LangGraph state.

Plain language: this is the agent's temporary working area for one conversation or work session.

It is not a real folder on disk. You cannot open it in Finder, and there is no normal folder path where you can inspect the files.

Without checkpointing, the files are effectively in memory for the active run. When the run or process state is gone, those files are gone too.

With checkpointing, the agent state can be saved between turns. In that case the files can still be available later in the same thread, but they are still stored as state data, not as normal files in a folder.

Checkpointing does not automatically write the virtual files as Finder-visible files on disk. A checkpointer decides where the saved state goes. Depending on the checkpointer, the state may be saved in memory, in a database such as SQLite or Postgres, in a cloud service, or by a custom file-based implementation. Even when checkpoint data is stored on disk, it is usually stored as checkpoint data, not as a friendly folder of separate files such as `/draft.txt` or `/notes.txt`.

It is the default backend. If no backend is configured, Deep Agents use `StateBackend`.

Good for:

- scratch files
- intermediate notes
- large tool results that the agent may need to read in smaller chunks
- experiments where no real filesystem access is needed

Important behavior:

- Files belong to the current thread. In plain language: they belong to the current conversation or work session.
- Files can still be available in later turns of the same thread if the application saves agent state with checkpointing.
- Files are not automatically shared with other threads. In plain language: another conversation does not automatically see them.
- Files are not normal files on the computer and do not have a Finder-visible folder location.

## FilesystemBackend

`FilesystemBackend` reads and writes real files under a configured root directory.

Plain language: this is how a Deep Agent gets access to the computer's filesystem.

Example:

```ts
import { createDeepAgent, FilesystemBackend } from 'deepagents';

const agent = createDeepAgent({
  model,
  backend: new FilesystemBackend({
    rootDir: '/Users/rolfdohrmann/workspace',
    virtualMode: true,
  }),
});
```

With this configuration, a virtual path like `/notes/todo.txt` maps to a real file under:

```text
/Users/rolfdohrmann/workspace/notes/todo.txt
```

`virtualMode` controls how file paths are interpreted.

With `virtualMode: true`, paths are treated as virtual paths inside `rootDir`:

```text
Agent path: /notes/todo.txt
Real file:  /Users/rolfdohrmann/workspace/notes/todo.txt
```

This is the safer mode. It keeps the agent inside the configured root directory and rejects path traversal patterns such as `..` or `~`.

With `virtualMode: false`, absolute paths are treated as real absolute paths on the machine:

```text
Agent path: /Users/rolfdohrmann/.env
Real file:  /Users/rolfdohrmann/.env
```

That means absolute paths can escape `rootDir`. Use this only for controlled local experiments where broad filesystem access is intentional.

Good for:

- local development tools
- coding assistants
- controlled experiments with real files
- CI or sandboxed project folders

Important behavior:

- It can grant access to real files.
- The operating system permissions of the Node process still apply.
- `virtualMode: true` keeps virtual paths inside `rootDir`.
- Broad roots, such as `/`, can expose much more than intended.
- This should be used very carefully in web servers or HTTP APIs.

## StoreBackend

`StoreBackend` stores files in a LangGraph store.

Plain language: this is durable memory for the agent.

It is useful when files should survive beyond one thread or one conversation. For example, an agent could store user preferences, long-term instructions, or accumulated research notes.

Good for:

- long-term memory
- cross-thread persistence
- user-specific or tenant-specific data
- information that should survive restarts when the store is persistent

Important behavior:

- It needs a store.
- The store may be in-memory for local development or persistent in a real deployment.
- Namespaces matter. They decide which user, tenant, or agent owns a stored file.
- It is not the same thing as direct disk access.

## CompositeBackend

`CompositeBackend` routes different path prefixes to different backends.

Plain language: this is a filesystem router.

Example idea:

```text
/workspace/  -> real disk through FilesystemBackend
/memories/   -> persistent storage through StoreBackend
everything else -> temporary thread state through StateBackend
```

Good for:

- combining scratch files with long-term memory
- exposing a real project folder while keeping internal agent files temporary
- separating application data by path
- giving the agent one filesystem interface without forcing one storage strategy

Important behavior:

- Routes are selected by path prefix.
- The default backend handles paths that do not match a route.
- This is often the cleanest production shape because it makes storage boundaries explicit.

## How The Tool Sees It

The built-in tools do not need to know which backend is underneath.

For example:

```json
{
  "file_path": "/memories/preferences.txt",
  "offset": 0,
  "limit": 100
}
```

The `read_file` tool passes this path to the configured backend.

If `/memories/` is routed to `StoreBackend`, it reads from persistent memory.

If `/memories/` is routed to `FilesystemBackend`, it reads from disk.

If there is no special route and the default is `StateBackend`, it reads from thread state.

## Simple Decision Guide

Use `StateBackend` when the agent only needs a temporary workspace.

Use `FilesystemBackend` when the agent should read or write real files on the machine.

Use `StoreBackend` when the agent should remember files across threads or sessions.

Use `CompositeBackend` when different paths should have different storage rules.
