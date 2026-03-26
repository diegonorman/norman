# Drive Corporativo Semeq - Planejamento Completo

## 1. VISÃO GERAL

### Objetivo
Sistema web responsivo para compartilhamento seguro de manuais técnicos, acessível apenas por colaboradores com email @semeq.com.br.

### Usuários
- Diretoria
- TAM (Technical Account Manager)
- Inspetores
- Comercial
- PCM (Planejamento e Controle de Manutenção)

### Dispositivos Suportados
- Desktop (Windows/Mac/Linux)
- Mobile (iOS/Android)
- Tablet

---

## 2. ARQUITETURA TÉCNICA

### 2.1 Componentes AWS

```
┌─────────────┐
│   Usuário   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│   CloudFront    │ ◄── CDN Global + WAF
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────────┐
│ S3     │ │ API Gateway  │
│(Static)│ │   + Lambda   │
└────────┘ └──────┬───────┘
              │
         ┌────┴────┐
         │         │
         ▼         ▼
    ┌─────────┐ ┌──────┐
    │ Cognito │ │  S3  │
    │  Auth   │ │(Docs)│
    └─────────┘ └──────┘
         │
         ▼
    ┌─────────┐
    │DynamoDB │ ◄── Logs/Metadata
    └─────────┘
```

### 2.2 Stack Tecnológico

**Frontend:**
- Framework: Next.js 14 (App Router)
- UI: Tailwind CSS + shadcn/ui
- State: React Query + Zustand
- PWA: next-pwa
- Deploy: AWS Amplify Hosting

**Backend:**
- Runtime: Node.js 20 (Lambda)
- Framework: API Gateway REST
- Language: TypeScript
- IaC: AWS SAM / CDK

**Banco de Dados:**
- DynamoDB (metadata, logs, permissões)
- S3 (armazenamento de arquivos)

---

## 3. SEGURANÇA - CAMADAS DE PROTEÇÃO

### 3.1 Autenticação (Cognito)

**Configuração:**
```yaml
UserPool:
  - Domínio permitido: @semeq.com.br
  - MFA: Opcional (SMS/TOTP)
  - Password Policy:
      - Mínimo: 12 caracteres
      - Complexidade: Maiúscula + Minúscula + Número + Especial
      - Expiração: 90 dias
  - Account Recovery: Email verificado
  - Email Verification: Obrigatório
```

**Fluxo de Registro:**
1. Usuário insere email
2. Sistema valida domínio @semeq.com.br
3. Se válido → envia código de verificação
4. Usuário confirma email
5. Define senha forte
6. Conta ativada

**Validação de Domínio:**
```javascript
// Lambda Pre-SignUp Trigger
exports.handler = async (event) => {
  const email = event.request.userAttributes.email;
  const domain = email.split('@')[1];
  
  if (domain !== 'semeq.com.br') {
    throw new Error('Apenas emails @semeq.com.br são permitidos');
  }
  
  return event;
};
```

### 3.2 Autorização (IAM + Lambda)

**Níveis de Acesso:**
- **Admin:** Upload, delete, gerenciar usuários
- **User:** Visualizar, baixar, buscar

**Controle de Acesso:**
```javascript
// Verificação em cada requisição
const userRole = await getUserRole(userId);
const hasPermission = checkPermission(userRole, action, resource);

if (!hasPermission) {
  return { statusCode: 403, body: 'Acesso negado' };
}
```

### 3.3 Proteção de Rede (WAF + CloudFront)

**AWS WAF Rules:**
```yaml
WAF_Rules:
  - Rate Limiting: 100 req/min por IP
  - Geo Blocking: Apenas Brasil (opcional)
  - SQL Injection Protection: Ativo
  - XSS Protection: Ativo
  - Bot Control: Bloquear bots maliciosos
  - IP Reputation: Bloquear IPs conhecidos
```

**CloudFront Security Headers:**
```javascript
headers: {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Content-Security-Policy': "default-src 'self'",
  'Referrer-Policy': 'strict-origin-when-cross-origin'
}
```

### 3.4 Proteção de Dados (S3)

**Bucket Configuration:**
```yaml
S3_Security:
  - Block Public Access: Habilitado
  - Encryption: AES-256 (SSE-S3)
  - Versioning: Habilitado
  - Lifecycle Policy:
      - Versões antigas → Glacier após 90 dias
      - Delete markers → Remover após 1 ano
  - Access Logging: Habilitado
  - Object Lock: Opcional (compliance)
```

**Presigned URLs:**
```javascript
// URLs temporárias com expiração
const url = s3.getSignedUrl('getObject', {
  Bucket: 'semeq-manuais',
  Key: fileKey,
  Expires: 300, // 5 minutos
  ResponseContentDisposition: 'attachment'
});
```

### 3.5 Auditoria e Monitoramento

**CloudWatch Logs:**
- Todos os acessos (quem, quando, qual arquivo)
- Tentativas de login falhas
- Erros de autorização
- Upload/Delete de arquivos

**CloudTrail:**
- Mudanças em IAM
- Alterações em buckets S3
- Modificações em Cognito

**Alertas:**
```yaml
Alarms:
  - Login failures > 5 em 5min → SNS
  - Download suspeito (>100 arquivos/hora) → SNS
  - Erro 403 > 10 em 1min → SNS
  - Lambda errors > 5% → SNS
```

**DynamoDB Audit Log:**
```javascript
{
  userId: 'user@semeq.com.br',
  action: 'DOWNLOAD',
  fileKey: 'manuais/equipamento-x.pdf',
  timestamp: '2026-03-11T11:30:00Z',
  ipAddress: '200.x.x.x',
  userAgent: 'Mozilla/5.0...'
}
```

### 3.6 Proteção contra Ameaças

**Prevenção de Ataques:**
- **DDoS:** CloudFront + Shield Standard
- **Brute Force:** Cognito rate limiting + WAF
- **CSRF:** Tokens em todas as requisições
- **Session Hijacking:** Tokens JWT com expiração curta (1h)
- **Man-in-the-Middle:** HTTPS obrigatório (TLS 1.3)

**Secrets Management:**
- API Keys → Secrets Manager
- Credenciais → Parameter Store (encrypted)
- Rotação automática de secrets

---

## 4. FUNCIONALIDADES

### 4.1 Autenticação
- [x] Login com email/senha
- [x] Registro (apenas @semeq.com.br)
- [x] Recuperação de senha
- [x] Verificação de email
- [x] MFA opcional
- [x] Logout
- [x] Sessão persistente (Remember me)

### 4.2 Navegação de Arquivos
- [x] Lista de manuais (grid/list view)
- [x] Busca por nome/tag/categoria
- [x] Filtros (categoria, data, tipo)
- [x] Ordenação (nome, data, tamanho)
- [x] Paginação
- [x] Breadcrumbs de navegação

### 4.3 Visualização
- [x] Preview de PDF no navegador
- [x] Thumbnail de arquivos
- [x] Informações do arquivo (tamanho, data, autor)
- [x] Histórico de versões

### 4.4 Download
- [x] Download individual
- [x] Download em lote (ZIP)
- [x] Retomada de download (Range requests)
- [x] Indicador de progresso

### 4.5 Upload (Admin)
- [x] Upload de arquivos (drag & drop)
- [x] Upload múltiplo
- [x] Validação de tipo (PDF, DOCX, XLSX, etc)
- [x] Limite de tamanho (100MB por arquivo)
- [x] Barra de progresso
- [x] Metadata (título, descrição, tags, categoria)

### 4.6 Gerenciamento (Admin)
- [x] Criar/editar/deletar categorias
- [x] Mover arquivos entre pastas
- [x] Renomear arquivos
- [x] Deletar arquivos (soft delete)
- [x] Restaurar arquivos deletados
- [x] Gerenciar permissões de usuários

### 4.7 Auditoria (Admin)
- [x] Dashboard de acessos
- [x] Relatório de downloads
- [x] Usuários mais ativos
- [x] Arquivos mais acessados
- [x] Logs de atividades

### 4.8 Mobile/PWA
- [x] Instalável como app
- [x] Funciona offline (cache de lista)
- [x] Notificações push (novos manuais)
- [x] Share nativo do SO
- [x] Biometria para login (Face ID/Touch ID)

---

## 5. ESTRUTURA DE DADOS

### 5.1 DynamoDB Tables

**Users Table:**
```javascript
{
  PK: 'USER#email@semeq.com.br',
  SK: 'PROFILE',
  email: 'email@semeq.com.br',
  name: 'João Silva',
  role: 'USER', // USER | ADMIN
  department: 'TAM',
  createdAt: '2026-03-11T10:00:00Z',
  lastLogin: '2026-03-11T11:00:00Z',
  status: 'ACTIVE' // ACTIVE | SUSPENDED
}
```

**Files Table:**
```javascript
{
  PK: 'FILE#uuid',
  SK: 'METADATA',
  fileKey: 'manuais/categoria/arquivo.pdf',
  title: 'Manual Equipamento X',
  description: 'Manual de operação...',
  category: 'Equipamentos',
  tags: ['equipamento', 'operação', 'segurança'],
  size: 2048576, // bytes
  mimeType: 'application/pdf',
  uploadedBy: 'admin@semeq.com.br',
  uploadedAt: '2026-03-11T10:00:00Z',
  version: 1,
  status: 'ACTIVE', // ACTIVE | DELETED
  downloadCount: 42
}
```

**Access Logs Table:**
```javascript
{
  PK: 'LOG#2026-03-11',
  SK: 'ACCESS#timestamp#userId',
  userId: 'user@semeq.com.br',
  action: 'DOWNLOAD', // VIEW | DOWNLOAD | UPLOAD | DELETE
  fileId: 'FILE#uuid',
  fileName: 'manual.pdf',
  ipAddress: '200.x.x.x',
  userAgent: 'Mozilla/5.0...',
  timestamp: '2026-03-11T11:30:00Z',
  ttl: 1735689600 // 90 dias
}
```

### 5.2 S3 Structure

```
semeq-manuais/
├── manuais/
│   ├── equipamentos/
│   │   ├── equipamento-a.pdf
│   │   └── equipamento-b.pdf
│   ├── procedimentos/
│   │   ├── proc-001.pdf
│   │   └── proc-002.pdf
│   └── seguranca/
│       └── manual-seguranca.pdf
└── thumbnails/
    └── [file-uuid].jpg
```

---

## 6. API ENDPOINTS

### 6.1 Autenticação
```
POST   /auth/register          - Registrar novo usuário
POST   /auth/login             - Login
POST   /auth/logout            - Logout
POST   /auth/refresh           - Refresh token
POST   /auth/forgot-password   - Recuperar senha
POST   /auth/reset-password    - Resetar senha
POST   /auth/verify-email      - Verificar email
```

### 6.2 Arquivos
```
GET    /files                  - Listar arquivos (paginado)
GET    /files/:id              - Detalhes do arquivo
GET    /files/:id/download     - Gerar URL de download
POST   /files                  - Upload arquivo (admin)
PUT    /files/:id              - Atualizar metadata (admin)
DELETE /files/:id              - Deletar arquivo (admin)
POST   /files/search           - Buscar arquivos
```

### 6.3 Categorias
```
GET    /categories             - Listar categorias
POST   /categories             - Criar categoria (admin)
PUT    /categories/:id         - Atualizar categoria (admin)
DELETE /categories/:id         - Deletar categoria (admin)
```

### 6.4 Usuários (Admin)
```
GET    /users                  - Listar usuários
GET    /users/:id              - Detalhes do usuário
PUT    /users/:id              - Atualizar usuário
DELETE /users/:id              - Suspender usuário
```

### 6.5 Auditoria (Admin)
```
GET    /audit/logs             - Logs de acesso
GET    /audit/stats            - Estatísticas
GET    /audit/downloads        - Relatório de downloads
```

---

## 7. INTERFACE DO USUÁRIO

### 7.1 Páginas

**Públicas:**
- `/login` - Tela de login
- `/register` - Registro de conta
- `/forgot-password` - Recuperar senha
- `/reset-password` - Resetar senha

**Privadas:**
- `/` - Dashboard / Lista de manuais
- `/files/:id` - Visualização de arquivo
- `/search` - Busca avançada
- `/profile` - Perfil do usuário

**Admin:**
- `/admin/dashboard` - Dashboard administrativo
- `/admin/files` - Gerenciar arquivos
- `/admin/users` - Gerenciar usuários
- `/admin/categories` - Gerenciar categorias
- `/admin/audit` - Logs e auditoria

### 7.2 Componentes Principais

**Layout:**
- Header (logo, busca, perfil, logout)
- Sidebar (categorias, filtros)
- Main content (grid/list de arquivos)
- Footer (links, versão)

**Cards de Arquivo:**
- Thumbnail
- Título
- Categoria/Tags
- Data de upload
- Tamanho
- Botões (visualizar, baixar, compartilhar)

**Modais:**
- Preview de PDF
- Upload de arquivo
- Confirmação de delete
- Detalhes do arquivo

---

## 8. PERFORMANCE E ESCALABILIDADE

### 8.1 Otimizações

**Frontend:**
- Code splitting (Next.js automático)
- Image optimization (next/image)
- Lazy loading de componentes
- Service Worker para cache
- Compressão Brotli/Gzip

**Backend:**
- Lambda Provisioned Concurrency (se necessário)
- DynamoDB On-Demand (auto-scaling)
- S3 Transfer Acceleration
- CloudFront cache (TTL: 1 hora para estáticos)

**Banco de Dados:**
- DynamoDB GSI para queries otimizadas
- Paginação em todas as listas
- Cache de queries frequentes (ElastiCache opcional)

### 8.2 Limites e Quotas

```yaml
Limites:
  - Upload: 100MB por arquivo
  - Batch download: 10 arquivos por vez
  - API rate: 100 req/min por usuário
  - Storage: Ilimitado (S3)
  - Usuários: Ilimitado (Cognito)
```

---

## 9. CUSTOS ESTIMADOS (Mensal)

### Cenário: 50 usuários, 1000 arquivos, 5000 downloads/mês

```
CloudFront:      $5   (50GB transferência)
S3:              $3   (100GB armazenamento + requests)
Lambda:          $2   (100k invocações)
API Gateway:     $1   (100k requests)
Cognito:         $0   (50 MAU - free tier)
DynamoDB:        $1   (On-Demand)
Amplify Hosting: $0   (free tier)
WAF:             $5   (regras básicas)
CloudWatch:      $2   (logs + métricas)
-----------------------------------
TOTAL:          ~$19/mês
```

**Escalabilidade:**
- 500 usuários: ~$50/mês
- 5000 usuários: ~$200/mês

---

## 10. CRONOGRAMA DE DESENVOLVIMENTO

### Fase 1: Infraestrutura (1 semana)
- [ ] Setup AWS (Cognito, S3, DynamoDB)
- [ ] Configurar IAM roles e policies
- [ ] Setup CloudFront + WAF
- [ ] Configurar domínio e certificado SSL

### Fase 2: Backend (2 semanas)
- [ ] Lambdas de autenticação
- [ ] API de arquivos (CRUD)
- [ ] Sistema de upload/download
- [ ] Logs e auditoria
- [ ] Testes unitários

### Fase 3: Frontend (2 semanas)
- [ ] Setup Next.js + UI components
- [ ] Páginas de autenticação
- [ ] Dashboard e listagem
- [ ] Upload e gerenciamento
- [ ] Busca e filtros
- [ ] Responsividade mobile

### Fase 4: Admin Panel (1 semana)
- [ ] Dashboard administrativo
- [ ] Gerenciamento de usuários
- [ ] Gerenciamento de arquivos
- [ ] Relatórios e auditoria

### Fase 5: PWA e Mobile (1 semana)
- [ ] Configurar PWA
- [ ] Offline support
- [ ] Push notifications
- [ ] Testes em dispositivos

### Fase 6: Testes e Deploy (1 semana)
- [ ] Testes de segurança
- [ ] Testes de performance
- [ ] Testes de usabilidade
- [ ] Deploy em produção
- [ ] Documentação

**TOTAL: 8 semanas**

---

## 11. MANUTENÇÃO E SUPORTE

### 11.1 Monitoramento
- CloudWatch Dashboards
- Alertas via SNS/Email
- Logs centralizados
- Métricas de uso

### 11.2 Backup
- S3 Versioning habilitado
- DynamoDB Point-in-Time Recovery
- Backup diário automático
- Retenção: 30 dias

### 11.3 Atualizações
- Dependências: Mensal
- Segurança: Imediato
- Features: Conforme demanda

---

## 12. RISCOS E MITIGAÇÕES

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Vazamento de dados | Alto | Baixo | Criptografia, WAF, auditoria |
| Indisponibilidade | Médio | Baixo | Multi-AZ, CloudFront, monitoring |
| Custos elevados | Médio | Médio | Alertas de billing, otimização |
| Acesso não autorizado | Alto | Baixo | Cognito, validação de domínio, MFA |
| Perda de arquivos | Alto | Muito Baixo | Versioning, backup, replicação |

---

## 13. PRÓXIMOS PASSOS

1. **Aprovação do planejamento**
2. **Setup da conta AWS (projeto501)**
3. **Criação do repositório Git**
4. **Início do desenvolvimento (Fase 1)**

---

## 14. CONTATOS E RESPONSABILIDADES

**Desenvolvimento:** Kiro + Alteon
**Infraestrutura AWS:** Alteon (conta projeto501)
**Validação de Requisitos:** Diretoria Semeq
**Testes:** TAM, Inspetores, PCM

---

**Documento criado em:** 2026-03-11
**Versão:** 1.0
**Status:** Aguardando aprovação
