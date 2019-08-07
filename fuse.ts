import { fusebox } from 'fuse-box';
import { spawn } from 'child_process';

const production = process.env.NODE_ENV === 'dev' ? false : true;

const getConfig = (target: string) => {
  return {
    homeDir: 'src/',
    devServer: false,
    target,
    output: 'build/$name.js',
    cache: { root: '.cache' },
    dependencies: { ignoreAllExternal: true },
    alias: {
      '~': '~/',
    },
    watch: true,

    // logging: {
    //   level: 'verbose',
    // },
  } as any;
};

const getRendererConfig = (target: string) => {
  const cfg = Object.assign({}, getConfig(target), {
    sourceMaps: !production,
  });

  return cfg;
};

const main = () => {
  const cfg = getConfig('server');

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
    target: 'app.html',
  };
  cfg.useSingleBundle = true;
  cfg.entry = ['renderer/views/app/index.tsx'];

  const fuse = fusebox(cfg);

  if (!production) {
    fuse.runDev();
  } else {
    fuse.runProd();
  }
};

renderer();
main();
