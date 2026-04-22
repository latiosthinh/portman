const express = require('express');
const { getListeningPorts, getProcessName } = require('./lib/port-detector');
const path = require('path');

const app = express();
const PORT = 8765;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/api/ports', async (req, res) => {
  const ports = await getListeningPorts();
  const enriched = await Promise.all(ports.map(async p => {
    const proc = await getProcessName(p.pid);
    return { ...p, processName: proc.name, isSystem: p.isSystem || proc.isSystem };
  }));
  res.json(enriched);
});

app.use(express.static('.'));

app.listen(PORT, () => {
  console.log(`Test server running at http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT}/test-filter.html to test filters`);
});
