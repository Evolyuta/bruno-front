import React, { useEffect, useMemo, useRef, forwardRef } from 'react';
import { useDispatch } from 'react-redux';
import useGraphqlSchema from './useGraphqlSchema';
import { IconBook, IconDownload, IconLoader2, IconRefresh, IconPaperclip, IconX } from '@tabler/icons';
import get from 'lodash/get';
import { findEnvironmentInCollection } from 'utils/collections';
import { updateRequestGraphqlVariables } from 'providers/ReduxStore/slices/collections';
import { useCustomFeature, CUSTOM_FEATURES } from 'utils/custom-features';
import Dropdown from '../../Dropdown';
import toast from 'react-hot-toast';

const getAttachedFiles = (item) => {
  const variables = item.draft
    ? get(item, 'draft.request.body.graphql.variables', '')
    : get(item, 'request.body.graphql.variables', '');

  try {
    const parsed = variables ? JSON.parse(variables) : {};
    const files = [];

    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'string' && value.startsWith('@file:')) {
        files.push({ varName: key, path: value.substring(6), isArray: false });
      } else if (Array.isArray(value)) {
        value.forEach((v, i) => {
          if (typeof v === 'string' && v.startsWith('@file:')) {
            files.push({ varName: key, index: i, path: v.substring(6), isArray: true });
          }
        });
      }
    }
    return files;
  } catch (e) {
    return [];
  }
};

const GraphQLSchemaActions = ({ item, collection, onSchemaLoad, toggleDocs }) => {
  const dispatch = useDispatch();
  const schemaOneClick = useCustomFeature(CUSTOM_FEATURES.SCHEMA_ONE_CLICK);
  const fileUploadEnabled = useCustomFeature(CUSTOM_FEATURES.GRAPHQL_FILE_UPLOAD);

  const url = item.draft ? get(item, 'draft.request.url', '') : get(item, 'request.url', '');
  const pathname = item.draft ? get(item, 'draft.pathname', '') : get(item, 'pathname', '');
  const uid = item.draft ? get(item, 'draft.uid', '') : get(item, 'uid', '');
  const environment = findEnvironmentInCollection(collection, collection.activeEnvironmentUid);
  const request = item.draft ? { ...item.draft.request, pathname, uid } : { ...item.request, pathname, uid };

  let {
    schema,
    schemaSource,
    loadSchema,
    isLoading: isSchemaLoading
  } = useGraphqlSchema(url, environment, request, collection);

  useEffect(() => {
    if (onSchemaLoad) {
      onSchemaLoad(schema);
    }
  }, [schema]);

  // Original dropdown refs (used when schemaOneClick is disabled)
  const schemaDropdownTippyRef = useRef();
  const onSchemaDropdownCreate = (ref) => (schemaDropdownTippyRef.current = ref);

  const MenuIcon = forwardRef((props, ref) => {
    return (
      <div ref={ref} className="dropdown-icon cursor-pointer flex hover:underline ml-2">
        {isSchemaLoading && <IconLoader2 className="animate-spin" size={18} strokeWidth={1.5} />}
        {!isSchemaLoading && schema && <IconRefresh size={18} strokeWidth={1.5} />}
        {!isSchemaLoading && !schema && <IconDownload size={18} strokeWidth={1.5} />}
        <span className="ml-1">Schema</span>
      </div>
    );
  });

  const attachedFiles = useMemo(() => getAttachedFiles(item), [
    item.draft ? get(item, 'draft.request.body.graphql.variables') : get(item, 'request.body.graphql.variables')
  ]);

  const onAttachFiles = async () => {
    try {
      const { ipcRenderer } = window;
      const filePaths = await ipcRenderer.invoke('renderer:open-file-dialog', {
        properties: ['openFile', 'multiSelections']
      });

      if (!filePaths || filePaths.length === 0) return;

      const variables = item.draft
        ? get(item, 'draft.request.body.graphql.variables', '')
        : get(item, 'request.body.graphql.variables', '');

      let currentVars = {};
      try {
        currentVars = variables ? JSON.parse(variables) : {};
      } catch (e) {
        currentVars = {};
      }

      if (filePaths.length === 1) {
        currentVars['file'] = `@file:${filePaths[0]}`;
      } else {
        currentVars['files'] = filePaths.map((filePath) => `@file:${filePath}`);
      }

      dispatch(
        updateRequestGraphqlVariables({
          variables: JSON.stringify(currentVars, null, 2),
          itemUid: item.uid,
          collectionUid: collection.uid
        })
      );

      toast.success(`${filePaths.length} file(s) attached`);
    } catch (error) {
      console.error(error);
      toast.error('Error selecting files');
    }
  };

  const onClearFiles = () => {
    const variables = item.draft
      ? get(item, 'draft.request.body.graphql.variables', '')
      : get(item, 'request.body.graphql.variables', '');

    let currentVars = {};
    try {
      currentVars = variables ? JSON.parse(variables) : {};
    } catch (e) {
      return;
    }

    for (const key of Object.keys(currentVars)) {
      const value = currentVars[key];
      if (typeof value === 'string' && value.startsWith('@file:')) {
        delete currentVars[key];
      } else if (Array.isArray(value) && value.some((v) => typeof v === 'string' && v.startsWith('@file:'))) {
        delete currentVars[key];
      }
    }

    dispatch(
      updateRequestGraphqlVariables({
        variables: Object.keys(currentVars).length > 0 ? JSON.stringify(currentVars, null, 2) : '',
        itemUid: item.uid,
        collectionUid: collection.uid
      })
    );
  };

  return (
    <div className="flex flex-grow justify-end items-center flex-wrap">
      <div className="flex items-center cursor-pointer hover:underline" onClick={toggleDocs}>
        <IconBook size={18} strokeWidth={1.5} />
        <span className="ml-1">Docs</span>
      </div>

      {schemaOneClick ? (
        <div
          className="cursor-pointer flex hover:underline ml-2"
          onClick={() => !isSchemaLoading && loadSchema('introspection')}
        >
          {isSchemaLoading && <IconLoader2 className="animate-spin" size={18} strokeWidth={1.5} />}
          {!isSchemaLoading && schema && <IconRefresh size={18} strokeWidth={1.5} />}
          {!isSchemaLoading && !schema && <IconDownload size={18} strokeWidth={1.5} />}
          <span className="ml-1">Schema</span>
        </div>
      ) : (
        <Dropdown onCreate={onSchemaDropdownCreate} icon={<MenuIcon />} placement="bottom-start">
          <div
            className="dropdown-item"
            onClick={() => {
              schemaDropdownTippyRef.current.hide();
              loadSchema('introspection');
            }}
          >
            {schema && schemaSource === 'introspection' ? 'Refresh from Introspection' : 'Load from Introspection'}
          </div>
          <div
            className="dropdown-item"
            onClick={() => {
              schemaDropdownTippyRef.current.hide();
              loadSchema('file');
            }}
          >
            Load from File
          </div>
        </Dropdown>
      )}

      {fileUploadEnabled && (
        <>
          <div
            className="cursor-pointer flex hover:underline ml-2"
            onClick={onAttachFiles}
            title="Attach files for GraphQL Upload"
          >
            <IconPaperclip size={18} strokeWidth={1.5} />
            <span className="ml-1">Files{attachedFiles.length > 0 ? ` (${attachedFiles.length})` : ''}</span>
          </div>
          {attachedFiles.length > 0 && (
            <div
              className="cursor-pointer flex items-center ml-1 opacity-60 hover:opacity-100"
              onClick={onClearFiles}
              title="Remove all files"
            >
              <IconX size={14} strokeWidth={1.5} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GraphQLSchemaActions;
