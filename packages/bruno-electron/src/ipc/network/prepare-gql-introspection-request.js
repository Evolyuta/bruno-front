const { get, each } = require('lodash');
const { interpolate } = require('@usebruno/common');
const { getIntrospectionQuery } = require('graphql');
const { setAuthHeaders } = require('./prepare-request');
const { getPreferences } = require('../../store/preferences');

const prepareGqlIntrospectionRequest = (endpoint, resolvedVars, request, collectionRoot) => {
  if (endpoint && endpoint.length) {
    endpoint = interpolate(endpoint, resolvedVars);
  }

  const queryParams = {
    query: getIntrospectionQuery()
  };

  const preferences = getPreferences();
  const headerNameInterpolation = preferences?.customFeatures?.headerNameInterpolation !== false;

  let axiosRequest = {
    method: 'POST',
    url: endpoint,
    headers: {
      ...mapHeaders(request.headers, get(collectionRoot, 'request.headers', []), resolvedVars, headerNameInterpolation),
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    data: JSON.stringify(queryParams)
  };

  return setAuthHeaders(axiosRequest, request, collectionRoot);
};

const mapHeaders = (requestHeaders, collectionHeaders, resolvedVars, interpolateNames) => {
  const headers = {};

  // Add collection headers first
  each(collectionHeaders, (h) => {
    if (h.enabled) {
      const name = interpolateNames ? interpolate(h.name, resolvedVars) : h.name;
      headers[name] = interpolate(h.value, resolvedVars);
    }
  });

  // Then add request headers, which will overwrite if names overlap
  each(requestHeaders, (h) => {
    if (h.enabled) {
      const name = interpolateNames ? interpolate(h.name, resolvedVars) : h.name;
      headers[name] = interpolate(h.value, resolvedVars);
    }
  });

  return headers;
};

module.exports = prepareGqlIntrospectionRequest;
