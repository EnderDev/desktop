import { fusebox } from 'fuse-box';
import { spawn } from 'child_process';
import { IPublicConfig } from 'fuse-box/config/IPublicConfig';

const production = process.env.NODE_ENV === 'dev' ? false : true;

const getConfig = (target: string) => {
  return {
    homeDir: 'src/',
    cache: !production,
    devServer: !production,
    watch: !production,
    target,
    output: 'build/$name.js',
    useTypescriptCompiler: true,
    alias: {
      '~': '~/',
    },
    log: {
      showBundledFiles: false,
    },
  } as IPublicConfig;
};

const getRendererConfig = (target: string) => {
  const cfg = Object.assign({}, getConfig(target), {
    sourceMaps: !production,
  });

  return cfg;
};

const main = () => {
  const cfg = getConfig('electron');

  cfg.entry = 'main/index.ts';

  const fuse = fusebox(cfg);

  if (!production) {
    fuse.runDev();
  } else {
    fuse.runProd();
  }
};

const renderer = () => {
  const cfg = getRendererConfig('electron');
  cfg.webIndex = {
    template: 'static/pages/app.html',
    target: `app.html`,
  };
  cfg.entry = [
    'renderer/views/app/index.tsx',
    'renderer/views/auth/index.tsx',
    'renderer/views/permissions/index.tsx',
    'renderer/views/find/index.tsx',
    'renderer/views/form-fill/index.tsx',
    'renderer/views/credentials/index.tsx',
  ];

  const fuse = fusebox(cfg);

  if (!production) {
    fuse.runDev();
  } else {
    fuse.runProd();
  }
};

renderer();
main();
