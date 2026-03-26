const fs = require('fs');
const path = require('path');
const axios = require('axios');

const api = axios.create({
  baseURL: 'https://base.archcloud.com.br/api/v2',
  headers: { 'xc-token': 'NGqq6w8rSbkwc5COh_XB3lnOfKOgzi2xt7TpdPni' }
});

async function syncVideosToDatabase() {
  try {
    console.log('🔄 Adicionando vídeos ao banco...');

    const basesRes = await api.get('/meta/bases');
    const baseId = basesRes.data.list[0].id;
    const tablesRes = await api.get(`/meta/bases/${baseId}/tables`);
    const videosTable = tablesRes.data.list.find(t => t.title === 'videos');

    if (!videosTable) {
      console.error('Tabela videos não encontrada');
      return;
    }

    const mapPath = path.join(__dirname, '../lib/video-map.json');
    
    if (!fs.existsSync(mapPath)) {
      console.log('video-map.json não encontrado');
      return;
    }
    
    const videoMap = JSON.parse(fs.readFileSync(mapPath, 'utf-8'));

    let added = 0;

    for (const [category, videos] of Object.entries(videoMap)) {
      for (const video of videos) {
        await api.post(`/tables/${videosTable.id}/records`, {
          title: video.name,
          url: video.path,
          category: category,
          muscle_group: category,
          difficulty: 'intermediate'
        });
        added++;
      }
    }

    console.log(`✅ ${added} vídeos adicionados!`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

syncVideosToDatabase();
