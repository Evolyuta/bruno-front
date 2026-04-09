const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

/**
 * Checks if GraphQL variables contain file upload references.
 * File uploads are indicated by string values starting with "@file:" prefix.
 * Example: { "file": "@file:/path/to/file.pdf" }
 */
const hasFileUploads = (variables) => {
  if (!variables || typeof variables !== 'object') {
    return false;
  }
  return JSON.stringify(variables).includes('"@file:');
};

/**
 * Extracts file paths from variables and builds the multipart request
 * according to graphql-multipart-request-spec.
 *
 * Spec: https://github.com/jaydenseric/graphql-multipart-request-spec
 *
 * The request is structured as:
 * - "operations": JSON string with query and variables (files replaced with null)
 * - "map": JSON mapping of file field index to variable path
 * - "0", "1", ...: actual file streams
 */
const buildGraphqlMultipartFormData = (query, variables, collectionPath) => {
  const form = new FormData();
  const fileMap = {};
  const cleanedVariables = JSON.parse(JSON.stringify(variables));
  let fileIndex = 0;

  const processValue = (obj, currentPath) => {
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      const valuePath = currentPath ? `${currentPath}.${key}` : key;

      if (typeof value === 'string' && value.startsWith('@file:')) {
        const filePath = value.substring(6);
        const index = String(fileIndex);
        fileMap[index] = [`variables.${valuePath}`];
        obj[key] = null;

        let resolvedPath = filePath.trim();
        if (collectionPath && !path.isAbsolute(resolvedPath)) {
          resolvedPath = path.join(collectionPath, resolvedPath);
        }

        form.append(index, fs.createReadStream(resolvedPath), {
          filename: path.basename(resolvedPath)
        });

        fileIndex++;
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        processValue(value, valuePath);
      } else if (Array.isArray(value)) {
        value.forEach((item, i) => {
          if (typeof item === 'string' && item.startsWith('@file:')) {
            const filePath = item.substring(6);
            const index = String(fileIndex);
            fileMap[index] = [`variables.${valuePath}.${i}`];
            value[i] = null;

            let resolvedPath = filePath.trim();
            if (collectionPath && !path.isAbsolute(resolvedPath)) {
              resolvedPath = path.join(collectionPath, resolvedPath);
            }

            form.append(index, fs.createReadStream(resolvedPath), {
              filename: path.basename(resolvedPath)
            });

            fileIndex++;
          } else if (item && typeof item === 'object') {
            processValue(item, `${valuePath}.${i}`);
          }
        });
      }
    }
  };

  processValue(cleanedVariables, '');

  const operations = JSON.stringify({
    query,
    variables: cleanedVariables
  });

  form.append('operations', operations);
  form.append('map', JSON.stringify(fileMap));

  return form;
};

module.exports = {
  hasFileUploads,
  buildGraphqlMultipartFormData
};
