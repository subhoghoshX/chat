import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);

export default async function handler() {
  try {
    const vercelOidcToken = process.env.VERCEL_OIDC_TOKEN;

    if (!vercelOidcToken) {
      console.error("VERCEL_OIDC_TOKEN environment variable is not set.");
    }

    const command = `npx convex env set VERCEL_OIDC_TOKEN "${vercelOidcToken}"`;

    const { stdout, stderr } = await execPromise(command);

    console.log(`stdout: ${stdout}`);

    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
  } catch (error) {
    console.error("Error executing cron job:", error);
  }
}
