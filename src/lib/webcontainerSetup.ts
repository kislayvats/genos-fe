import { WebContainer } from '@webcontainer/api';
import { FileItem } from '../types';

/** Vite must listen on all interfaces inside WebContainer for server-ready to fire. */
export function patchViteConfigForWebContainer(content: string): string {
  if (/host\s*:\s*(true|'0\.0\.0\.0'|"0\.0\.0\.0")/.test(content)) {
    return content;
  }

  if (content.includes('defineConfig({')) {
    return content.replace(
      /defineConfig\(\{/,
      `defineConfig({\n  server: {\n    host: true,\n    strictPort: true,\n  },`
    );
  }

  return content;
}

function patchFileTree(files: FileItem[]): FileItem[] {
  return files.map((file) => {
    if (file.type === 'folder' && file.children) {
      return { ...file, children: patchFileTree(file.children) };
    }
    if (
      file.type === 'file' &&
      (file.path === '/vite.config.ts' || file.name === 'vite.config.ts')
    ) {
      return {
        ...file,
        content: patchViteConfigForWebContainer(file.content || ''),
      };
    }
    return file;
  });
}

export function createMountStructure(files: FileItem[]): Record<string, unknown> {
  const mountStructure: Record<string, unknown> = {};

  const processFile = (file: FileItem, isRootFolder: boolean): unknown => {
    if (file.type === 'folder') {
      mountStructure[file.name] = {
        directory: file.children
          ? Object.fromEntries(
              file.children.map((child) => [child.name, processFile(child, false)])
            )
          : {},
      };
    } else if (file.type === 'file') {
      const entry = {
        file: {
          contents: file.content || '',
        },
      };
      if (isRootFolder) {
        mountStructure[file.name] = entry;
      } else {
        return entry;
      }
    }
    return mountStructure[file.name];
  };

  patchFileTree(files).forEach((file) => processFile(file, true));
  return mountStructure;
}

export async function runPreviewSetup(webcontainer: WebContainer): Promise<number> {
  try {
    const packageJsonExists = await webcontainer.fs
      .readFile('package.json', 'utf-8')
      .then(() => true)
      .catch(() => false);

    if (!packageJsonExists) {
      await webcontainer.fs.writeFile(
        'package.json',
        JSON.stringify(
          {
            name: 'my-project',
            type: 'module',
            scripts: { dev: 'vite' },
          },
          null,
          2
        )
      );
    }

    const installProcess = await webcontainer.spawn('pnpm', ['install']);
    installProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          console.log('📦 Installing:', data);
        },
      })
    );

    const installExitCode = await installProcess.exit;
    console.log('✅ Dependencies installed with exit code:', installExitCode);

    if (installExitCode !== 0) {
      return installExitCode;
    }

    const devProcess = await webcontainer.spawn('pnpm', ['dev']);
    devProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          console.log('🚀 Dev Server:', data);
        },
      })
    );

    return 0;
  } catch (error) {
    console.error('❌ Preview setup failed:', error);
    return 1;
  }
}
