const express = require('express');
const _ = require('lodash');

const app = express();
const jsonParser = require('body-parser').json;

const clients = {};
const getDefaultClientState = () => ({
  firstPollTime: Date.now(),
  lastPollTime: Date.now(),
  clientActions: [],
});
const initializeClientIfRequired = clientId => {
  if (!clients[clientId]) clients[clientId] = getDefaultClientState();
};

app.use(jsonParser());
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'content-type');
  next();
});

app.get('/', (req, res) => {
  res.send('hello world');
});

function addClientAction(clientId, type, options) {
  clients[clientId].clientActions.unshift({
    type,
    options,
    time: Date.now(),
  });
}

app.post('/api/client_actions', (req, res) => {
  const { body: { clientIds: clientIdsParam, type, options } } = req;
  _.forEach(clientIdsParam, (clientIdParam) => {
    if (clientIdParam === '*') {
      _.forEach(_.keys(clients), (clientId) => {
        addClientAction(clientId, type, options);
      });
    } else {
      initializeClientIfRequired(clientIdParam);
      addClientAction(clientIdParam, type, options);
    }
  });
  res.json({});
});

app.get('/api/client_actions/:clientId', (req, res) => {
  const { params: { clientId } } = req;
  initializeClientIfRequired(clientId);
  const clientState = clients[clientId];
  const { clientActions } = clientState;
  clientState.clientActions = [];
  clientState.lastPollTime = Date.now();
  res.json(clientActions);
});

app.get('/api/clients', (req, res) => {
  const clientKeys = _.keys(clients);
  const currentTime = Date.now();
  clientKeys.forEach(key => {
    if (currentTime - clients[key].lastPollTime > 10000) {
      delete clients[key];
    }
  });
  res.json(_.orderBy(_.keys(clients), clientKey => clients[clientKey].firstPollTime, 'asc'));
});

app.listen(3001, () => console.log('listening'));
