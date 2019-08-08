import { observer } from 'mobx-react-lite';
import * as React from 'react';
import { ipcRenderer } from 'electron';
import { parse } from 'url';

import store from '../../store';
import { Buttons, StyledToolbar, Handle, Separator } from './style';
import { NavigationButtons } from './NavigationButtons';
import { Tabbar } from './Tabbar';
import { ToolbarButton } from './ToolbarButton';
import { icons, colors } from '~/renderer/constants';
import { BrowserAction } from './BrowserAction';
import { platform } from 'os';
import { TOOLBAR_HEIGHT } from '../../constants';
import { closeWindow, minimizeWindow, maximizeWindow } from '../../utils';
import { WindowsControls } from 'react-windows-controls';

const onUpdateClick = () => {
  ipcRenderer.send('update-install');
};

const onKeyClick = () => {
  const { hostname } = parse(store.tabs.selectedTab.url);
  const list = store.autoFill.credentials.filter(
    r => r.url === hostname && r.fields.username,
  );

  ipcRenderer.send(`credentials-show-${store.windowId}`, {
    content: 'list',
    list,
  });
};

const onMenuClick = () => {
  ipcRenderer.send(`menu-show-${store.windowId}`);
};

const BrowserActions = observer(() => {
  const { selectedTabId } = store.tabGroups.currentGroup;

  return (
    <>
      {selectedTabId &&
        store.extensions.browserActions.map(item => {
          if (item.tabId === selectedTabId) {
            return <BrowserAction data={item} key={item.extensionId} />;
          }
          return null;
        })}
    </>
  );
});

export const Toolbar = observer(() => {
  const { selectedTab } = store.tabs;

  let isWindow = false;
  let blockedAds = 0;
  let hasCredentials = false;

  if (selectedTab) {
    isWindow = selectedTab.isWindow;
    blockedAds = selectedTab.blockedAds;
    hasCredentials = selectedTab.hasCredentials;
  }

  return (
    <StyledToolbar isHTMLFullscreen={store.isHTMLFullscreen}>
      <Handle />
      <NavigationButtons />
      <Tabbar />
      <Buttons>
        <BrowserActions />
        {store.updateInfo.available && (
          <ToolbarButton icon={icons.download} onClick={onUpdateClick} />
        )}
        {store.extensions.browserActions.length > 0 && <Separator />}
        {hasCredentials && (
          <ToolbarButton icon={icons.key} size={16} onClick={onKeyClick} />
        )}
        {!isWindow && (
          <BrowserAction
            size={18}
            style={{ marginLeft: 0 }}
            opacity={0.54}
            autoInvert
            data={{
              badgeBackgroundColor: colors.blue['500'],
              badgeText: blockedAds > 0 ? blockedAds.toString() : '',
              icon: icons.shield,
              badgeTextColor: 'white',
            }}
          />
        )}
        {store.isIncognito && (
          <>
            <Separator />
            <ToolbarButton icon={icons.incognito} size={18} />
          </>
        )}
        <ToolbarButton onClick={onMenuClick} icon={icons.more} size={18} />
      </Buttons>
      {platform() !== 'darwin' && (
        <WindowsControls
          style={{
            height: TOOLBAR_HEIGHT,
            WebkitAppRegion: 'no-drag',
          }}
          onClose={closeWindow}
          onMinimize={minimizeWindow}
          onMaximize={maximizeWindow}
        />
      )}
    </StyledToolbar>
  );
});
