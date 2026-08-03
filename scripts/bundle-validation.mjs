import * as esbuild from 'esbuild'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const entry = path.join(
	root,
	'dist/nodes/HookDeploy/shared/hookDeployWebhookValidation.js',
)

await esbuild.build({
	entryPoints: [entry],
	outfile: entry,
	bundle: true,
	platform: 'node',
	format: 'cjs',
	allowOverwrite: true,
	logLevel: 'info',
})
