const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const nocodbApi = axios.create({
  baseURL: 'https://base.archcloud.com.br',
  headers: { 'xc-token': 'NGqq6w8rSbkwc5COh_XB3lnOfKOgzi2xt7TpdPni' }
});

app.get('/api/videos', async (req, res) => {
  try {
    const response = await nocodbApi.get('/api/v2/tables/mkfa5k9g7iqbq1q/records');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(3000, () => console.log('🚀 Server: http://localhost:3000'));
