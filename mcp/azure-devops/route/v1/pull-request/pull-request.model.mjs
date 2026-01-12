import axios from 'axios';
import z from 'zod';
import { diffLines } from 'diff';

const azureSchema = z.object({
  organization: z.string().default('appvity').describe('Azure DevOps organization'),
  projectName: z.string().describe('Azure DevOps project name'),
  repositoryId: z.string().describe('Git repository ID'),
  // pullRequestId: z.number().describe('Pull request ID'),
  apiVersion: z.string().default('7.1'),
  baseVersion: z.string(),
  targetVersion: z.string(),
});

const getAllDiffsCommit = async (req) => {
  try {
    const parsedQuery = azureSchema.parse(req?.query);
    const URL =
      `https://dev.azure.com/${parsedQuery.organization}/${parsedQuery.projectName}` +
      `/_apis/git/repositories/${parsedQuery.repositoryId}` +
      `/diffs/commits?api-version=${parsedQuery.apiVersion}&baseVersion=${parsedQuery.baseVersion}` +
      `&baseVersionType=commit&targetVersion=${parsedQuery.targetVersion}&targetVersionType=commit`;

    const response = await axios.get(URL, {
      headers: {
        Authorization: 'Basic ' + Buffer.from(':' + process.env.AZURE_DEVOPS_PERSONAL_ACCESS_TOKEN).toString('base64'),
        Accept: 'application/json',
      },
    });

    // All changes
    const changes = response?.data?.changes || [];
    if (changes.length === 0) {
      return {
        ok: false,
        error: 'No changes found between the specified commits',
      };
    }

    // Get change files blob (ts,tsx,js,jsx)
    const files = changes
      .filter((c) => c.item.gitObjectType === 'blob' && c.item.path.match(/\.(ts|tsx|js|jsx)$/))
      .map((c) => ({ path: c.item.path, commitId: c.item.commitId, baseCommit: response?.data.baseCommit, targetCommit: response?.data.targetCommit }));

    if (files.length === 0) {
      return {
        ok: false,
        error: 'No code files (ts,tsx,js,jsx) found between the specified commits',
      };
    }

    const URL_GET_CONTENT_COMMIT = `https://dev.azure.com/${parsedQuery.organization}/${parsedQuery.projectName}/_apis/git/repositories/${parsedQuery.repositoryId}/items`;

    const getFileContent = async ({ path, commit }) => {
      const res = await axios.get(URL_GET_CONTENT_COMMIT, {
        params: {
          path,
          versionType: 'commit',
          version: commit,
          includeContent: true,
          'api-version': parsedQuery.apiVersion,
        },
        headers: {
          Authorization: 'Basic ' + Buffer.from(':' + process.env.AZURE_DEVOPS_PERSONAL_ACCESS_TOKEN).toString('base64'),
        },
      });

      return res.data;
    };

    const results = await Promise.all(
      files.map(async (file) => {
        const baseContent = await getFileContent({ path: file.path, commit: file.baseCommit });
        const targetContent = await getFileContent({ path: file.path, commit: file.targetCommit });

        return {
          path: file.path,
          aiDiff: buildAiDiff(baseContent?.content, targetContent?.content),
        };
      })
    );

    return {
      ok: true,
      data: results,
    };
  } catch (error) {
    return {
      ok: false,
      error: error?.message || 'Failed to get diffs commits',
    };
  }
};

const buildAiDiff = (baseContent, targetContent) => {
  const diffs = diffLines(baseContent || '', targetContent || '');

  return diffs
    .filter((part) => part.added || part.removed)
    .map((part) => {
      const prefix = part.added ? '+' : '-';
      return part.value
        .split('\n')
        .filter(Boolean)
        .map((line) => `${prefix} ${line}`)
        .join('\n');
    })
    .join('\n');
};

export { getAllDiffsCommit };
