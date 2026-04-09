import React, { useEffect } from 'react';
import useGraphqlSchema from './useGraphqlSchema';
import { IconBook, IconDownload, IconLoader2, IconRefresh } from '@tabler/icons';
import get from 'lodash/get';
import { findEnvironmentInCollection } from 'utils/collections';

const GraphQLSchemaActions = ({ item, collection, onSchemaLoad, toggleDocs }) => {
  const url = item.draft ? get(item, 'draft.request.url', '') : get(item, 'request.url', '');
  const pathname = item.draft ? get(item, 'draft.pathname', '') : get(item, 'pathname', '');
  const uid = item.draft ? get(item, 'draft.uid', '') : get(item, 'uid', '');
  const environment = findEnvironmentInCollection(collection, collection.activeEnvironmentUid);
  const request = item.draft ? { ...item.draft.request, pathname, uid } : { ...item.request, pathname, uid };

  let {
    schema,
    loadSchema,
    isLoading: isSchemaLoading
  } = useGraphqlSchema(url, environment, request, collection);

  useEffect(() => {
    if (onSchemaLoad) {
      onSchemaLoad(schema);
    }
  }, [schema]);

  return (
    <div className="flex flex-grow justify-end items-center">
      <div className="flex items-center cursor-pointer hover:underline" onClick={toggleDocs}>
        <IconBook size={18} strokeWidth={1.5} />
        <span className="ml-1">Docs</span>
      </div>
      <div
        className="cursor-pointer flex hover:underline ml-2"
        onClick={() => !isSchemaLoading && loadSchema('introspection')}
      >
        {isSchemaLoading && <IconLoader2 className="animate-spin" size={18} strokeWidth={1.5} />}
        {!isSchemaLoading && schema && <IconRefresh size={18} strokeWidth={1.5} />}
        {!isSchemaLoading && !schema && <IconDownload size={18} strokeWidth={1.5} />}
        <span className="ml-1">Schema</span>
      </div>
    </div>
  );
};

export default GraphQLSchemaActions;
