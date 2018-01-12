const express = require('express');

const app = express();
const jsonParser = require('body-parser').json;

const clients = {};
const getDefaultClientState = () => ({ lastPoll: undefined, actions: [] });
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

app.post('/api/actions', (req, res) => {
  const { body: { clientId } } = req;
  initializeClientIfRequired(clientId);
  clients[clientId].actions.unshift({
    type: req.body.type,
    options: req.body.options,
    time: Date.now(),
  });
  res.status(200).end();
});

app.get('/api/actions/:clientId', (req, res) => {
  const { params: { clientId } } = req;
  initializeClientIfRequired(clientId);
  const clientState = clients[clientId];
  const clientActions = clientState.actions;
  clientState.actions = [];
  clientState.lastPollTime = Date.now();
  res.json(clientActions);
});

app.get('/api/clients', (req, res) => {
  const clientKeys = Object.keys(clients);
  const currentTime = Date.now();
  clientKeys.forEach((key) => {
    if (currentTime - clients[key].lastPollTime > 10000) {
      delete clients[key];
    }
  });
  res.json(Object.keys(clients));
});

app.listen(3001, () => console.log('listening'));
