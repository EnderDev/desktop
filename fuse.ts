import { fusebox } from 'fuse-box';
import { spawn } from 'child_process';

const production = process.env.NODE_ENV === 'dev' ? false : true;

const getConfig = (target: string) => {
  return {
    homeDir: 'src/',
    target,
    output: 'build/$name.js',
    cache: { root: '.cache' },
    dependencies: { ignoreAllExternal: true },
    alias: {
      '~': '~/',
    },

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
  const cfg = getConfig('electron');

  cfg.homeDir = 'src/main';
  cfg.entry = 'index.ts';
  cfg.useSingleBundle = true;

  const fuse = fusebox(cfg);

  fuse.runDev(handler => {
    handler.onComplete(output => {
      output.electron.handleMainProcess();
    });
  })
};

const renderer = () => {
  const cfg = getRendererConfig('electron');

  cfg.webIndex = {
    template: 'static/pages/app.html',
    target: 'app.html',
  };
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
