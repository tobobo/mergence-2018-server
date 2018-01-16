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
const initializeClientIfRequired = (clientId) => {
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

app.post('/api/client_actions', (req, res) => {
  const { body: { clientId } } = req;
  initializeClientIfRequired(clientId);
  clients[clientId].clientActions.unshift({
    type: req.body.type,
    options: req.body.options,
    time: Date.now(),
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
  clientKeys.forEach((key) => {
    if (currentTime - clients[key].lastPollTime > 10000) {
      delete clients[key];
    }
  });
  res.json(_.orderBy(_.keys(clients), clientKey => clients[clientKey].firstPollTime, 'asc'));
});

app.listen(3001, () => console.log('listening'));
