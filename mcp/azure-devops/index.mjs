import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { communicationTools } from './tools/communication.mjs';
import { pullRequestTools } from './tools/pull-request.mjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

//#region Load .env file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({
  path: path.join(__dirname, '.env'),
  quiet: true,
});
//#endregion

//#region Register MCP Server
const server = new McpServer({
  name: 'My Simple Server',
  version: '1.0.0',
});
// #endregion

//#region Register Tools
export const tools = [...communicationTools, ...pullRequestTools];

tools.forEach((tool) =>
  server.registerTool(
    tool.name,
    {
      description: tool.description,
      inputSchema: tool.inputSchema,
    },
    tool.handler
  )
);
//#endregion

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('------------------------------------------------');
  console.error('MCP Server is running...');
  console.error('------------------------------------------------');
}

main().catch((error) => {
  console.error('Error running server:', error);
  process.exit(1);
});
