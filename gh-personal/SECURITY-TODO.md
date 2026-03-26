# ⚠️ IMPORTANTE: Segurança Multi-Personal

## Problema
Atualmente, todos os personals podem ver todos os alunos do sistema.

## Solução
Adicionar coluna `personal_id` na tabela `users` do NocoDB para vincular cada aluno ao seu personal.

## Como Adicionar no NocoDB:

1. Acesse: https://base.archcloud.com.br
2. Abra a tabela `users`
3. Adicione nova coluna:
   - **Nome**: `personal_id`
   - **Tipo**: Number
   - **Descrição**: ID do personal responsável pelo aluno

## Código já preparado em:
- `/app/api/students/route.ts` - Já filtra por personal_id
- Ao criar aluno, já salva o personal_id automaticamente

## Após adicionar a coluna:
1. Atualizar alunos existentes com personal_id correto
2. Sistema funcionará com isolamento total entre personals
3. Cada personal verá apenas seus próprios alunos

## Status: ⏳ Aguardando criação da coluna no NocoDB
