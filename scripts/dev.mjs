import { spawn } from 'node:child_process';
import { execSync } from 'node:child_process';
import { cp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const n8nUserFolder = path.join(homedir(), '.n8n-node-cli');
const packageName = 'n8n-nodes-hookdeploy';
const devPackageDir = path.join(n8nUserFolder, '.n8n', 'custom', 'node_modules', packageName);

const cacheDir = path.join(n8nUserFolder, '.cache', 'n8n');

async function installDevPackage() {
	await rm(devPackageDir, { recursive: true, force: true });
	await rm(cacheDir, { recursive: true, force: true });
	await mkdir(devPackageDir, { recursive: true });

	const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
	// Dev install mirrors publish layout: package.json + dist only (no node_modules).
	delete packageJson.devDependencies;
	delete packageJson.scripts;
	await writeFile(path.join(devPackageDir, 'package.json'), JSON.stringify(packageJson, null, '\t'));

	const distLink = path.join(devPackageDir, 'dist');
	await symlink(path.join(root, 'dist'), distLink, 'junction');
}

await installDevPackage();
execSync('n8n-node build', { cwd: root, stdio: 'inherit' });

const env = {
	...process.env,
	N8N_DEV_RELOAD: 'true',
	N8N_USER_FOLDER: n8nUserFolder,
	DB_SQLITE_POOL_SIZE: '10',
};

const children = [];
const isWin = process.platform === 'win32';

function run(name, cmd, args, options = {}) {
	const child = spawn(cmd, args, {
		cwd: options.cwd ?? root,
		env: options.env ?? process.env,
		stdio: 'inherit',
		shell: isWin,
	});
	child.on('exit', (code) => {
		if (code && code !== 0) {
			console.error(`${name} exited with code ${code}`);
			for (const other of children) {
				if (other !== child && !other.killed) other.kill();
			}
			process.exit(code);
		}
	});
	children.push(child);
	return child;
}

run('TypeScript', 'npm', ['exec', '--', 'tsc', '--watch', '--pretty']);
run('n8n', 'npx', ['-y', '--prefer-online', 'n8n@2.22.0', 'start'], { cwd: n8nUserFolder, env });

process.on('SIGINT', () => {
	for (const child of children) {
		if (!child.killed) child.kill();
	}
	process.exit(0);
});

console.log('\nHookDeploy dev server — open http://127.0.0.1:5678\n');
