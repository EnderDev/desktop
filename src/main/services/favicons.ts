import { ipcMain } from 'electron';
import * as fileType from 'file-type';
import icojs = require('icojs');

import storage from './storage';
import { IFavicon } from '~/interfaces';
import { requestURL } from '~/utils';

const favicons: Map<string, string> = new Map();

const convertIcoToPng = (icoData: Buffer) => {
  return new Promise((resolve: (b: Buffer) => void) => {
    icojs.parse(icoData, 'image/png').then((images: any) => {
      resolve(images[0].buffer);
    });
  });
};

const readImage = (buffer: Buffer) => {
  return new Promise((resolve: (b: Buffer) => void) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(Buffer.from(reader.result as any));
    };

    reader.readAsArrayBuffer(new Blob([buffer]));
  });
};


export const runFaviconsService = () => {
  ipcMain.on('favicons-get', async (e, id: string, url: string) => {
    let data = favicons.get(url);

    if (!data) {
      const item: IFavicon = await storage.findOne({
        scope: 'favicons',
        query: {
          url,
        }
      });

      data = item.data;
      favicons.set(url, item.data);
    }

    e.sender.send(id, data);
  });

  ipcMain.on('favicons-add', async (e, id: string, url: string) => {
    let str = favicons.get(url);

    if (!str) {
      try {
        const res = await requestURL(url);

        if (res.statusCode === 404) {
          throw new Error('404 favicon not found');
        }

        let data = Buffer.from(res.data, 'binary');

        const type = fileType(data);

        if (type && type.ext === 'ico') {
          data = await readImage(await convertIcoToPng(data));
        }

        str = `data:png;base64,${data.toString('base64')}`;

        await storage.insert({
          scope: 'favicons',
          item: {
            url,
            data: str,
          }
        })
      } catch (e) {
        console.error(e);
      }
    }

    e.sender.send(id, str);
  });
}
