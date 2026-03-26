# 🐳 Deploy Docker - GH Personal

## 📋 Pré-requisitos

1. Docker Hub account
2. Portainer Swarm configurado
3. Traefik configurado (para SSL)

---

## 🚀 Deploy Rápido

### 1. Build e Push para Docker Hub

```bash
# Login no Docker Hub
docker login

# Build da imagem
docker build -t seunome/gh-personal:latest .

# Push para Docker Hub
docker push seunome/gh-personal:latest
```

### 2. Configurar Variáveis no Portainer

No Portainer, crie um **Stack** com estas variáveis:

```env
DOCKER_USERNAME=seunome
DOMAIN=ghpersonal.seudominio.com.br
NEXT_PUBLIC_NOCODB_URL=https://base.archcloud.com.br/api/v2
NOCODB_API_TOKEN=NGqq6w8rSbkwc5COh_XB3lnOfKOgzi2xt7TpdPni
JWT_SECRET=gh_personal_super_secret_key_2026_change_in_prod
```

### 3. Deploy no Portainer

1. Acesse Portainer
2. Vá em **Stacks** → **Add Stack**
3. Nome: `gh-personal`
4. Cole o conteúdo do `docker-compose.yml`
5. Adicione as variáveis de ambiente
6. Clique em **Deploy**

---

## 🔧 Comandos Úteis

### Build local
```bash
docker build -t gh-personal:local .
```

### Testar localmente
```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_NOCODB_URL=https://base.archcloud.com.br/api/v2 \
  -e NOCODB_API_TOKEN=NGqq6w8rSbkwc5COh_XB3lnOfKOgzi2xt7TpdPni \
  -e JWT_SECRET=gh_personal_super_secret_key_2026 \
  gh-personal:local
```

### Ver logs no Swarm
```bash
docker service logs gh-personal_gh-personal -f
```

### Atualizar imagem
```bash
# Build nova versão
docker build -t seunome/gh-personal:latest .

# Push
docker push seunome/gh-personal:latest

# Atualizar no Swarm (Portainer faz automaticamente)
docker service update --image seunome/gh-personal:latest gh-personal_gh-personal
```

---

## 📦 Estrutura Docker

### Dockerfile (Multi-stage)
```
1. deps    → Instala dependências
2. builder → Build do Next.js
3. runner  → Imagem final (otimizada)
```

### Volumes
```
gh-personal-videos → Armazena vídeos enviados
```

### Network
```
traefik-public → Rede compartilhada com Traefik
```

---

## 🔒 Segurança

### Variáveis Sensíveis
- ✅ Nunca commitar `.env.local`
- ✅ Usar secrets do Portainer
- ✅ Trocar `JWT_SECRET` em produção
- ✅ Usar HTTPS (Traefik + Let's Encrypt)

### Recomendações
```bash
# Gerar JWT_SECRET seguro
openssl rand -base64 32
```

---

## 🌐 Traefik Labels

O `docker-compose.yml` já inclui labels para:
- ✅ SSL automático (Let's Encrypt)
- ✅ Roteamento por domínio
- ✅ Load balancer (2 réplicas)

---

## 📊 Monitoramento

### Ver status
```bash
docker service ls
docker service ps gh-personal_gh-personal
```

### Ver logs
```bash
docker service logs gh-personal_gh-personal --tail 100 -f
```

### Escalar
```bash
docker service scale gh-personal_gh-personal=4
```

---

## 🔄 CI/CD (Futuro)

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and Push
        run: |
          docker login -u ${{ secrets.DOCKER_USERNAME }} -p ${{ secrets.DOCKER_PASSWORD }}
          docker build -t ${{ secrets.DOCKER_USERNAME }}/gh-personal:latest .
          docker push ${{ secrets.DOCKER_USERNAME }}/gh-personal:latest
```

---

## ⚠️ Troubleshooting

### Erro: "Cannot find module"
```bash
# Rebuild sem cache
docker build --no-cache -t seunome/gh-personal:latest .
```

### Erro: "ECONNREFUSED NocoDB"
```bash
# Verificar variáveis de ambiente
docker service inspect gh-personal_gh-personal --pretty
```

### Vídeos não aparecem
```bash
# Verificar volume
docker volume inspect gh-personal_gh-personal-videos
```

---

## 📝 Checklist de Deploy

- [ ] Build da imagem
- [ ] Push para Docker Hub
- [ ] Configurar variáveis no Portainer
- [ ] Deploy do Stack
- [ ] Verificar SSL (https://)
- [ ] Testar login
- [ ] Testar upload de vídeo
- [ ] Verificar logs

---

**Última atualização:** 05/03/2026
