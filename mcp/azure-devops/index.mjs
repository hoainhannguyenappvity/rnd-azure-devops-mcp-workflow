import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { communicationTools } from './tools/communication.mjs';
import { pullRequestTools } from './tools/pull-request.mjs';

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

// import express from 'express';
// import http from 'node:http';
// import { V1Router } from './route/v1/v1.mjs';

//#region Express App Setup
// const app = express();
// app.use(express.json());
//#endregion

// const server2 = http.createServer(app);
// server2.once('listening', () => {
//   console.error('Server listening at http://localhost:1234');
//   console.error('------------------------------------------------');
// });

// app.use('/mcp/api/v1', V1Router);

// server2.listen({ port: 1234, hostname: 'localhost' });
