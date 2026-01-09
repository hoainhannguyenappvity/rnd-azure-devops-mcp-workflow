import axios from 'axios';
import { z } from 'zod';

export const pullRequestTools = [
  {
    name: 'review',
    description: 'Get commits of a pull request from Azure DevOps',
    inputSchema: z.object({
      organization: z.string().default('appvity').describe('Azure DevOps organization'),
      projectName: z.string().describe('Azure DevOps project name'),
      repositoryId: z.string().describe('Git repository ID'),
      pullRequestId: z.number().describe('Pull request ID'),
      apiVersion: z.string().default('7.1'),
    }),
    handler: async ({ organization, projectName, repositoryId, pullRequestId, apiVersion }) => {
      const allCommits = await getAllCommits(organization, projectName, repositoryId, pullRequestId, apiVersion);

      if (allCommits?.length === 0) return { content: [{ type: 'text', text: 'No commits found for this pull request.' }] };

      const commitIds = allCommits?.map((commit) => commit.commitId).join(', ');

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                commitIds,
                instruction: 'Use these commit IDs to review the changes in the pull request.',
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },
];

const getAllCommits = async (organization, projectName, repositoryId, pullRequestId, apiVersion) => {
  const URL =
    `https://dev.azure.com/${organization}/${projectName}` + `/_apis/git/repositories/${repositoryId}` + `/pullRequests/${pullRequestId}/commits?api-version=${apiVersion}`;
  const response = await axios.get(URL, {
    headers: {
      Authorization: 'Basic ' + Buffer.from(':' + process.env.AZURE_DEVOPS_PERSONAL_ACCESS_TOKEN).toString('base64'),
      Accept: 'application/json',
    },
  });
  return response.data.value;
};
