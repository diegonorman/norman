import axios from 'axios';

const NOCODB_URL = process.env.NEXT_PUBLIC_NOCODB_URL!;
const TOKEN = process.env.NOCODB_API_TOKEN!;

export const nocodbApi = axios.create({
  baseURL: NOCODB_URL,
  headers: {
    'xc-token': TOKEN,
    'Content-Type': 'application/json'
  }
});

// Cache de IDs de tabelas
const tableIdCache: { [key: string]: string } = {};

// Buscar ID da tabela por nome (com cache)
export async function getTableId(tableName: string): Promise<string> {
  // Retornar do cache se existir
  if (tableIdCache[tableName]) {
    return tableIdCache[tableName];
  }

  try {
    const basesRes = await nocodbApi.get('/meta/bases');
    const baseId = basesRes.data.list[0].id;
    const tablesRes = await nocodbApi.get(`/meta/bases/${baseId}/tables`);
    const table = tablesRes.data.list.find((t: any) => t.title === tableName);
    
    if (table) {
      // Salvar no cache
      tableIdCache[tableName] = table.id;
      return table.id;
    }
    
    throw new Error(`Tabela ${tableName} não encontrada`);
  } catch (error) {
    console.error('Erro ao buscar ID da tabela:', error);
    throw error;
  }
}

// Helper para buscar dados de uma tabela
export async function getTableData(tableName: string, params?: any) {
  const tableId = await getTableId(tableName);
  const response = await nocodbApi.get(`/tables/${tableId}/records`, { params });
  return response.data;
}

// Alias para getTableData (retorna lista de registros)
export async function getRecords(tableName: string, params?: any) {
  const data = await getTableData(tableName, params);
  return data.list || [];
}

// Helper para criar registro
export async function createRecord(tableName: string, data: any) {
  const tableId = await getTableId(tableName);
  const response = await nocodbApi.post(`/tables/${tableId}/records`, data);
  return response.data;
}

// Helper para atualizar registro
export async function updateRecord(tableName: string, id: string, data: any) {
  const tableId = await getTableId(tableName);
  const response = await nocodbApi.patch(`/tables/${tableId}/records`, [{
    id: parseInt(id),
    ...data
  }]);
  return response.data;
}

// Helper para deletar registro
export async function deleteRecord(tableName: string, id: string) {
  const tableId = await getTableId(tableName);
  const response = await nocodbApi.delete(`/tables/${tableId}/records/${id}`);
  return response.data;
}
