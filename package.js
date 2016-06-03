Package.describe({
  name: 'classcraft:microsoft-graph',
  summary: "A Meteor library to interact with Microsoft Graph (ported from percolate:google-api)",
  version: '1.0.0',
  git: 'https://github.com/classcraft/microsoft-graph'
});

Package.on_use(function (api, where) {
  if (api.versionsFrom) {
    api.versionsFrom('0.9.0');
    api.use(['http', 'livedata', 'mrt:q@1.0.1', 'accounts-base', 'underscore']);
  } else {
    api.use(['http', 'livedata', 'q', 'accounts-base', 'underscore']);
  }

  api.add_files(['utils.js', 'ms-graph-async.js'], ['client', 'server']);
  api.add_files(['ms-graph-methods.js'], ['server']);

  api.export('MicrosoftGraph', ['client', 'server']);
});