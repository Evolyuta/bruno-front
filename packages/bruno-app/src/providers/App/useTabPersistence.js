import { useEffect, useRef } from 'react';
import { useSelector, useDispatch, useStore } from 'react-redux';
import { restoreTabs } from 'providers/ReduxStore/slices/tabs';
import { mountCollection } from 'providers/ReduxStore/slices/collections/actions';
import { toggleCollection } from 'providers/ReduxStore/slices/collections';
import { findItemInCollection, findItemInCollectionByPathname } from 'utils/collections';

const useTabPersistence = () => {
  const dispatch = useDispatch();
  const store = useStore();
  const tabs = useSelector((state) => state.tabs.tabs);
  const activeTabUid = useSelector((state) => state.tabs.activeTabUid);
  const restoredRef = useRef(false);

  const getCollections = () => store.getState().collections.collections;

  // Restore tabs on startup
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    const restore = async () => {
      try {
        const { ipcRenderer } = window;
        const savedState = await ipcRenderer.invoke('renderer:get-saved-tabs');
        if (!savedState?.tabs?.length) return;

        // Wait for collections to appear in Redux
        await new Promise((resolve) => {
          const check = () => {
            const collections = getCollections();
            if (collections.length > 0) {
              resolve();
            } else {
              setTimeout(check, 200);
            }
          };
          check();
        });

        // Mount unmounted collections that contain saved tabs
        const collections = getCollections();
        for (const collection of collections) {
          if (collection.mountStatus !== 'mounted' && collection.pathname) {
            const hasSavedTab = savedState.tabs.some((tab) =>
              tab.itemPathname?.startsWith(collection.pathname)
            );
            if (hasSavedTab) {
              await dispatch(mountCollection({
                collectionUid: collection.uid,
                collectionPathname: collection.pathname,
                brunoConfig: collection.brunoConfig
              }));
              if (collection.collapsed) {
                dispatch(toggleCollection(collection.uid));
              }
            }
          }
        }

        // Wait for items to be loaded by file watcher
        await new Promise((resolve) => {
          let attempts = 0;
          const check = () => {
            attempts++;
            const currentCollections = getCollections();
            const hasItems = savedState.tabs.some((tab) => {
              if (!tab.itemPathname) return false;
              return currentCollections.some((c) =>
                findItemInCollectionByPathname(c, tab.itemPathname)
              );
            });

            if (hasItems || attempts > 60) {
              resolve();
            } else {
              setTimeout(check, 500);
            }
          };
          setTimeout(check, 1000);
        });

        // Now restore tabs
        const currentCollections = getCollections();
        const restoredTabList = [];
        let restoredActiveUid = null;

        for (const savedTab of savedState.tabs) {
          let foundItem = null;
          let foundCollection = null;

          for (const collection of currentCollections) {
            if (savedTab.itemPathname) {
              foundItem = findItemInCollectionByPathname(collection, savedTab.itemPathname);
            }
            if (!foundItem) {
              foundItem = findItemInCollection(collection, savedTab.uid);
            }
            if (foundItem) {
              foundCollection = collection;
              break;
            }
          }

          if (foundItem && foundCollection) {
            restoredTabList.push({
              ...savedTab,
              uid: foundItem.uid,
              collectionUid: foundCollection.uid,
              folderUid: foundItem.uid,
              preview: false
            });

            if (savedTab.itemPathname === savedState.activeItemPathname) {
              restoredActiveUid = foundItem.uid;
            }
          }
        }

        if (restoredTabList.length > 0) {
          dispatch(restoreTabs({
            tabs: restoredTabList,
            activeTabUid: restoredActiveUid || restoredTabList[restoredTabList.length - 1].uid
          }));
        }
      } catch (error) {
        console.error('[TabPersistence] Failed to restore tabs:', error);
      }
    };

    restore();
  }, []);

  // Save tabs on change
  useEffect(() => {
    if (!restoredRef.current) return;

    const collections = getCollections();
    const persistableTypes = ['request', 'graphql-request', 'grpc-request', 'ws-request'];
    const persistableTabs = tabs.filter((tab) => persistableTypes.includes(tab.type));

    const enrichedTabs = persistableTabs.map((tab) => {
      let itemPathname = null;
      for (const collection of collections) {
        const item = findItemInCollection(collection, tab.uid);
        if (item) {
          itemPathname = item.pathname;
          break;
        }
      }
      return { ...tab, itemPathname };
    });

    let activeItemPathname = null;
    const activeTab = tabs.find((t) => t.uid === activeTabUid);
    if (activeTab) {
      for (const collection of collections) {
        const item = findItemInCollection(collection, activeTab.uid);
        if (item) {
          activeItemPathname = item.pathname;
          break;
        }
      }
    }

    try {
      const { ipcRenderer } = window;
      ipcRenderer.invoke('renderer:update-ui-state-snapshot', {
        type: 'TABS',
        data: { tabs: enrichedTabs, activeTabUid, activeItemPathname }
      });
    } catch (error) {
      console.error('[TabPersistence] Failed to save tabs:', error);
    }
  }, [tabs, activeTabUid]);
};

export default useTabPersistence;
