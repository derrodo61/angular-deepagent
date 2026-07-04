export type ExperimentStatus = 'Ready for notes' | 'Next up' | 'Planned';

export interface Experiment {
  readonly id: string;
  readonly title: string;
  readonly status: ExperimentStatus;
  readonly summary: string;
  readonly docUrl: string;
  readonly checks: readonly string[];
}

export interface ExperimentSection {
  readonly title: string;
  readonly experiments: readonly Experiment[];
}

export const experimentSections: readonly ExperimentSection[] = [
  {
    title: 'Getting Started',
    experiments: [
      {
        id: 'overview',
        title: 'Overview',
        status: 'Ready for notes',
        summary: 'Map the Deep Agents concepts into this Angular and TypeScript backend workbench.',
        docUrl: 'https://docs.langchain.com/oss/javascript/deepagents/overview',
        checks: [
          'Identify the SDK primitives',
          'List the examples to reproduce',
          'Keep browser and backend duties separate',
        ],
      },
      {
        id: 'quickstart',
        title: 'Quickstart',
        status: 'Ready for notes',
        summary:
          'Run the documented TypeScript research agent with Tavily search through the backend proxy.',
        docUrl: 'https://docs.langchain.com/oss/javascript/deepagents/quickstart',
        checks: [
          'Verify current imports',
          'Create the Tavily search tool',
          'Inspect search calls and final report',
        ],
      },
      {
        id: 'customization',
        title: 'Customization',
        status: 'Next up',
        summary:
          'Customization is split into focused subpages so each documented option can be tested independently.',
        docUrl: 'https://docs.langchain.com/oss/javascript/deepagents/customization',
        checks: [
          'Track the documented customization topics',
          'Keep each behavior in a separate run',
          'Use traces to verify what actually happened',
        ],
      },
      {
        id: 'customization-tools',
        title: 'Customization / Tools',
        status: 'Planned',
        summary: 'Customize the agent with documented domain tools and inspect tool behavior.',
        docUrl: 'https://docs.langchain.com/oss/javascript/deepagents/customization#tools',
        checks: ['Verify tool schema', 'Show arguments and result', 'Compare with built-in tools'],
      },
      {
        id: 'customization-mcp-tools',
        title: 'Customization / MCP Tools',
        status: 'Planned',
        summary: 'Load tools from an MCP server only after checking the current setup path.',
        docUrl: 'https://docs.langchain.com/oss/javascript/deepagents/customization#mcp-tools',
        checks: ['Verify MCP client setup', 'List loaded tools', 'Handle connection errors'],
      },
      {
        id: 'customization-system-prompt',
        title: 'Customization / System Prompt',
        status: 'Planned',
        summary: 'Test how caller-supplied instructions affect the Deep Agents harness prompt.',
        docUrl: 'https://docs.langchain.com/oss/javascript/deepagents/customization#system-prompt',
        checks: ['Set a focused prompt', 'Verify behavior change', 'Preserve harness guidance'],
      },
      {
        id: 'customization-middleware',
        title: 'Customization / Middleware',
        status: 'Planned',
        summary: 'Add custom middleware after the default stack and inspect its effect.',
        docUrl: 'https://docs.langchain.com/oss/javascript/deepagents/customization#middleware',
        checks: [
          'Confirm default stack position',
          'Log a middleware event',
          'Avoid shared mutation',
        ],
      },
      {
        id: 'customization-interpreters',
        title: 'Customization / Interpreters',
        status: 'Planned',
        summary: 'Evaluate the documented interpreter middleware as an isolated experiment.',
        docUrl: 'https://docs.langchain.com/oss/javascript/deepagents/customization#interpreters',
        checks: [
          'Verify package/API status',
          'Restrict execution scope',
          'Display interpreter calls',
        ],
      },
      {
        id: 'customization-subagents',
        title: 'Customization / Subagents',
        status: 'Planned',
        summary: 'Configure custom subagents and inspect delegation via the task tool.',
        docUrl: 'https://docs.langchain.com/oss/javascript/deepagents/customization#subagents',
        checks: [
          'Define a specialized subagent',
          'Observe task delegation',
          'Compare subagent and main-agent output',
        ],
      },
    ],
  },
  {
    title: 'Core',
    experiments: [
      {
        id: 'models',
        title: 'Models',
        status: 'Planned',
        summary:
          'Compare documented model configuration paths without leaking credentials to Angular.',
        docUrl: 'https://docs.langchain.com/oss/javascript/deepagents/models',
        checks: [
          'Keep credentials backend-only',
          'Surface model selection safely',
          'Handle provider errors clearly',
        ],
      },
      {
        id: 'tools',
        title: 'Tools',
        status: 'Planned',
        summary: 'Add typed tools and inspect their input, output, and trace events.',
        docUrl: 'https://docs.langchain.com/oss/javascript/deepagents/tools',
        checks: ['Validate tool schemas', 'Display tool activity', 'Test invalid input handling'],
      },
      {
        id: 'streaming',
        title: 'Streaming',
        status: 'Planned',
        summary: 'Use the documented streaming APIs and normalize events for the Angular UI.',
        docUrl: 'https://docs.langchain.com/oss/javascript/deepagents/streaming',
        checks: [
          'Verify stream event shape',
          'Render incremental output',
          'Recover from interrupted streams',
        ],
      },
      {
        id: 'backends',
        title: 'Backends',
        status: 'Planned',
        summary:
          'Test filesystem and backend behavior from the Node proxy, not the browser bundle.',
        docUrl: 'https://docs.langchain.com/oss/javascript/deepagents/backends',
        checks: [
          'Keep file access server-side',
          'Use explicit working areas',
          'Report backend state to the UI',
        ],
      },
      {
        id: 'permissions',
        title: 'Permissions',
        status: 'Planned',
        summary:
          'Exercise permission boundaries and make allowed actions visible before agent runs.',
        docUrl: 'https://docs.langchain.com/oss/javascript/deepagents/permissions',
        checks: [
          'Declare allowed actions',
          'Block unsafe operations',
          'Show permission failures clearly',
        ],
      },
    ],
  },
  {
    title: 'Agent Capabilities',
    experiments: [
      {
        id: 'subagents',
        title: 'Subagents',
        status: 'Planned',
        summary: 'Create documented subagent flows and inspect how work is delegated.',
        docUrl: 'https://docs.langchain.com/oss/javascript/deepagents/subagents',
        checks: [
          'Verify subagent configuration',
          'Show delegation events',
          'Keep result ownership clear',
        ],
      },
      {
        id: 'async-subagents',
        title: 'Async Subagents',
        status: 'Planned',
        summary: 'Test asynchronous subagent behavior when the docs path calls for it.',
        docUrl: 'https://docs.langchain.com/oss/javascript/deepagents/async-subagents',
        checks: [
          'Track pending work',
          'Handle partial completion',
          'Display failures per subagent',
        ],
      },
      {
        id: 'human-in-the-loop',
        title: 'Human-in-the-loop',
        status: 'Planned',
        summary: 'Add approval and resume flows for operations that need human confirmation.',
        docUrl: 'https://docs.langchain.com/oss/javascript/deepagents/human-in-the-loop',
        checks: ['Pause at approval points', 'Resume with explicit input', 'Preserve run context'],
      },
      {
        id: 'memory',
        title: 'Memory',
        status: 'Planned',
        summary: 'Explore documented memory behavior with visible state and reset controls.',
        docUrl: 'https://docs.langchain.com/oss/javascript/deepagents/memory',
        checks: ['Show stored state', 'Support reset', 'Separate test memory from app config'],
      },
      {
        id: 'skills',
        title: 'Skills',
        status: 'Planned',
        summary: 'Test skill loading and execution using documented TypeScript examples.',
        docUrl: 'https://docs.langchain.com/oss/javascript/deepagents/skills',
        checks: [
          'Verify skill format',
          'Show selected skill context',
          'Handle missing skill files',
        ],
      },
    ],
  },
  {
    title: 'Advanced',
    experiments: [
      {
        id: 'sandboxes',
        title: 'Sandboxes',
        status: 'Planned',
        summary: 'Evaluate sandboxed execution paths while keeping privileges explicit.',
        docUrl: 'https://docs.langchain.com/oss/javascript/deepagents/sandboxes',
        checks: ['Document sandbox boundary', 'Capture execution logs', 'Display failure modes'],
      },
      {
        id: 'mcp',
        title: 'MCP',
        status: 'Planned',
        summary: 'Connect MCP examples only after checking current SDK documentation.',
        docUrl: 'https://docs.langchain.com/oss/javascript/deepagents/mcp',
        checks: ['Verify client setup', 'List exposed tools', 'Test connection errors'],
      },
      {
        id: 'deep-agents-code',
        title: 'Deep Agents Code',
        status: 'Planned',
        summary: 'Explore the code-oriented docs path as a later, isolated experiment.',
        docUrl: 'https://docs.langchain.com/oss/javascript/deepagents/deep-agents-code',
        checks: [
          'Confirm package/API status',
          'Keep generated work isolated',
          'Review filesystem effects',
        ],
      },
    ],
  },
];

export const experiments = experimentSections.flatMap((section) => section.experiments);
