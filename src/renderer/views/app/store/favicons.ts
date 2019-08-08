import { makeId } from '~/utils';
import { observable } from 'mobx';
import { ipcRenderer } from 'electron';

export class FaviconsStore {
  @observable
  public favicons: Map<string, string> = new Map();

  public addFavicon = async (url: string): Promise<string> => {
    return new Promise(async resolve => {
      const data = this.favicons.get(url);
      if (data) return resolve(data);

      const id = makeId(32);

      ipcRenderer.send('favicons-add', id, url);

      ipcRenderer.once(id, (e, data) => {
        this.favicons.set(url, data);
        resolve(data);
      });
    });
  };
}
