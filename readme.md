# Bruno Extended

Fork of [Bruno](https://github.com/usebruno/bruno) — open-source API client with custom extensions for better GraphQL workflow.

All custom features are **enabled by default** and can be individually disabled in **Preferences > Extensions**, fully reverting to original Bruno behavior.

## Installation

### Linux

```bash
# Clone
git clone git@github.com:Evolyuta/bruno-front.git
cd bruno-front

# Install nvm and Node 22
nvm install 22.12.0
nvm use

# Install dependencies and build
npm i --legacy-peer-deps
npm run setup
```

### Windows

```bash
git clone git@github.com:Evolyuta/bruno-front.git
cd bruno-front

nvm install 22.12.0
nvm use

npm i --legacy-peer-deps
npm run setup
```

### macOS

```bash
git clone git@github.com:Evolyuta/bruno-front.git
cd bruno-front

nvm install 22.12.0
nvm use

npm i --legacy-peer-deps
npm run setup
```

### Running in dev mode

```bash
# Linux/macOS — use the start script (handles VS Code env variables)
./start-dev.sh

# Or manually (required if running from VS Code terminal)
unset ELECTRON_RUN_AS_NODE
unset ELECTRON_NO_ATTACH_CONSOLE
unset HTTP_PROXY
unset HTTPS_PROXY
npm run dev
```

## Custom Extensions

All extensions can be toggled in **Preferences > Extensions**.

### Schema One-Click
Click the Schema button to instantly run introspection without a dropdown menu.
When disabled: original dropdown with "Load from Introspection" / "Load from File" options.

### Header Name Interpolation
Environment variables (e.g. `{{appTokenKey}}`) are interpolated in header **names** for introspection requests, not just values.
When disabled: only header values are interpolated (original behavior).

### Restore Tabs on Startup
Previously opened request tabs are restored when the app starts, including sidebar state.
When disabled: app starts with empty workspace overview (original behavior).

### Preserve Search Case
Search input keeps the original case as typed instead of forcing lowercase.
When disabled: search text is converted to lowercase (original behavior).

### Prettify Keeps Scroll Position
Scroll position and cursor are preserved after prettifying a GraphQL query.
When disabled: editor scrolls to top after prettify (original behavior).

### GraphQL Error Banner
A red banner with the error message is shown above the response when GraphQL returns errors.
When disabled: no banner, errors only visible in JSON response (original behavior).

### Persist Sidebar Width
Sidebar width is saved between sessions.
When disabled: sidebar resets to 250px default on restart (original behavior).

### Full Tab Names
Tab names are shown in full without truncation. Close button is a regular element, not an overlay.
When disabled: tabs limited to 180px with fade effect (original behavior).

### GraphQL File Upload
Support for file uploads via [graphql-multipart-request-spec](https://github.com/jaydenseric/graphql-multipart-request-spec).
Use the **Files** button next to Schema to attach files. In variables, files are referenced as `@file:/path/to/file`.

Single file:
```json
{
  "file": "@file:/home/user/photo.png"
}
```

Multiple files:
```json
{
  "files": ["@file:/home/user/file1.png", "@file:/home/user/file2.png"]
}
```

When disabled: Files button is hidden, file upload not available (original behavior).

## License

[MIT](license.md)

Based on [Bruno](https://github.com/usebruno/bruno) by Anoop M D and contributors.
