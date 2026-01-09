import { z } from 'zod';

export const communicationTools = [
  {
    name: 'greet',
    description: 'Gửi lời chào đến ai đó',
    inputSchema: z.object({
      name: z.string(),
    }),
    handler: async ({ name }) => {
      return {
        content: [{ type: 'text', text: `Xin chào ${name} from MCP Server!` }],
      };
    },
  },
  {
    name: 'farewell',
    description: 'Gửi lời tạm biệt đến ai đó',
    inputSchema: z.object({
      name: z.string(),
    }),
    handler: async ({ name }) => ({
      content: [{ type: 'text', text: `Tạm biệt ${name} from MCP Server!` }],
    }),
  },
];
