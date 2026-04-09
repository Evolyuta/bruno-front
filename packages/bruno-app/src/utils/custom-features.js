import { useSelector } from 'react-redux';

export const CUSTOM_FEATURES = Object.freeze({
  SCHEMA_ONE_CLICK: 'schemaOneClick',
  HEADER_NAME_INTERPOLATION: 'headerNameInterpolation',
  RESTORE_TABS: 'restoreTabs',
  PRESERVE_SEARCH_CASE: 'preserveSearchCase',
  PRETTIFY_KEEP_SCROLL: 'prettifyKeepScroll',
  GRAPHQL_ERROR_BANNER: 'graphqlErrorBanner',
  PERSIST_SIDEBAR_WIDTH: 'persistSidebarWidth',
  FULL_TAB_NAMES: 'fullTabNames',
  GRAPHQL_FILE_UPLOAD: 'graphqlFileUpload'
});

export const CUSTOM_FEATURES_META = [
  {
    id: CUSTOM_FEATURES.SCHEMA_ONE_CLICK,
    label: 'Schema one-click',
    description: 'Click Schema to instantly run introspection without dropdown menu'
  },
  {
    id: CUSTOM_FEATURES.HEADER_NAME_INTERPOLATION,
    label: 'Header name interpolation',
    description: 'Interpolate environment variables in header names for introspection requests'
  },
  {
    id: CUSTOM_FEATURES.RESTORE_TABS,
    label: 'Restore tabs on startup',
    description: 'Restore previously opened request tabs when app starts'
  },
  {
    id: CUSTOM_FEATURES.PRESERVE_SEARCH_CASE,
    label: 'Preserve search case',
    description: 'Keep original case in search input instead of forcing lowercase'
  },
  {
    id: CUSTOM_FEATURES.PRETTIFY_KEEP_SCROLL,
    label: 'Prettify keeps scroll position',
    description: 'Preserve scroll position and cursor after prettifying query'
  },
  {
    id: CUSTOM_FEATURES.GRAPHQL_ERROR_BANNER,
    label: 'GraphQL error banner',
    description: 'Show error banner above response when GraphQL returns errors'
  },
  {
    id: CUSTOM_FEATURES.PERSIST_SIDEBAR_WIDTH,
    label: 'Persist sidebar width',
    description: 'Remember sidebar width between sessions'
  },
  {
    id: CUSTOM_FEATURES.FULL_TAB_NAMES,
    label: 'Full tab names',
    description: 'Show full request names in tabs without truncation'
  },
  {
    id: CUSTOM_FEATURES.GRAPHQL_FILE_UPLOAD,
    label: 'GraphQL file upload',
    description: 'Support file uploads in GraphQL via multipart request spec'
  }
];

export const useCustomFeature = (featureName) => {
  const preferences = useSelector((state) => state.app.preferences);
  // All custom features are enabled by default
  const value = preferences?.customFeatures?.[featureName];
  return value !== undefined ? value : true;
};
