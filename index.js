const express = require('express');
const app = express();
const jsonParser = require('body-parser').json;

const actions = {};

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
  const clientId = req.body.client;
  if (!actions[clientId]) actions[clientId] = [];
  actions[clientId].unshift({
    name: req.body.name,
    options: req.body.options,
    time: Date.now()
  });
  console.log('actions', actions);
  res.status(200).end();
});

app.get('/api/actions/:clientId', (req, res) => {
  const clientActions = actions[req.params.clientId] || [];
  actions[req.params.clientId] = [];
  console.log('ca', clientActions);
  res.json(clientActions);
});

app.listen(3001, () => console.log('listening'));
