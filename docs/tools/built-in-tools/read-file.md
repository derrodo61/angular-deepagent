# read_file

`read_file` is a built-in Deep Agents filesystem tool. It reads content from the configured Deep Agents virtual filesystem and returns it to the model.

Deep Agents documentation describes it as part of the built-in filesystem tool set:

- [Virtual filesystem access](https://docs.langchain.com/oss/javascript/deepagents/overview#virtual-filesystem-access)
- [Built-in harness tools](https://docs.langchain.com/oss/javascript/deepagents/tools#built-in-harness-tools)

## Call Shape

```json
{
  "file_path": "/path/to/file.txt",
  "offset": 0,
  "limit": 100
}
```

`file_path` is required. It is the absolute path inside the Deep Agents virtual filesystem.

`offset` is optional. It is a zero-based logical line offset. `offset: 0` starts at the first line.

`limit` is optional. It is the maximum number of logical file lines to read. In the installed TypeScript package, the tool-level default is `100`.

## Result

For text files, `read_file` returns text with line numbers.

For supported non-text files, the official docs say it can return multimodal content blocks, such as image, audio, video, or file blocks.

If the file cannot be read, the tool returns an error message.

## Line Limits

`limit` does not mean characters, browser rows, or visible wrapped lines.

It means logical file lines after splitting the file content on newline characters.

This matters when a file contains very long lines. For example, minified JSON may contain one extremely long logical line. A UI can wrap that one line across many visible rows, but `read_file` still counts it as one line.

Use `offset` and `limit` together to read large files in pages:

```json
{
  "file_path": "/path/to/file.txt",
  "offset": 100,
  "limit": 100
}
```

This reads up to 100 logical lines starting after the first 100 logical lines.
