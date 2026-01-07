# Guia para Resolver o Problema de SSL - cepa.angra.io

## 🔴 Problema Identificado

O Certbot está falhando porque o Let's Encrypt não consegue validar o domínio através do Cloudflare. O DNS está apontando para IPs do Cloudflare (172.67.220.180, 104.21.51.40) em vez de apontar diretamente para o servidor.

## ✅ Solução Recomendada: Configurar Cloudflare para DNS Only

### Passo 1: Desabilitar Proxy do Cloudflare (Temporariamente)

1. Acesse o painel do Cloudflare: https://dash.cloudflare.com
2. Selecione o domínio `angra.io`
3. Vá em **DNS > Records**
4. Encontre o registro **A** para `cepa.angra.io`
5. **Clique no ícone laranja (proxied)** ao lado do registro
6. Mude para **modo cinza (DNS only)** - isso desabilita o proxy
7. Aguarde alguns minutos para o DNS propagar

**Nota**: Após gerar o certificado SSL, você pode voltar a ativar o proxy do Cloudflare se desejar.

### Passo 2: Verificar DNS

Aguarde 2-5 minutos e verifique se o DNS está apontando para o IP do servidor:

```bash
dig +short cepa.angra.io
# Deve retornar: 191.96.81.68
```

Se ainda estiver retornando IPs do Cloudflare, aguarde mais alguns minutos.

### Passo 3: Gerar Certificado SSL

Com o DNS apontando corretamente, execute no servidor:

```bash
ssh cepalab@192.168.100.20
# Senha: abc123..

# Opção A: Usar modo standalone (recomendado)
sudo systemctl stop nginx
pm2 stop cepalab-juridico

sudo certbot certonly --standalone \
  -d cepa.angra.io \
  --non-interactive \
  --agree-tos \
  --email alceu@angra.io \
  --preferred-challenges http

# Reiniciar serviços
sudo systemctl start nginx
pm2 start cepalab-juridico

# Configurar Nginx com SSL
sudo certbot --nginx -d cepa.angra.io --non-interactive --redirect
```

### Passo 4: Verificar SSL

Após concluir, teste:

```bash
curl -I https://cepa.angra.io
# Deve retornar HTTP 200 ou 301
```

---

## 🔄 Alternativa: Validação DNS (Sem Parar Serviços)

Se você não quiser parar os serviços, pode usar validação DNS:

```bash
sudo certbot certonly --manual --preferred-challenges dns \
  -d cepa.angra.io \
  --email alceu@angra.io \
  --agree-tos
```

O Certbot irá pedir para você criar um registro TXT no DNS. Após criar, pressione Enter para continuar.

Depois, configure o Nginx:

```bash
sudo certbot --nginx -d cepa.angra.io --non-interactive --redirect
```

---

## 🛠️ Solução Automática (Script)

Execute o script que foi criado no servidor:

```bash
ssh cepalab@192.168.100.20
sudo /tmp/generate-ssl.sh
```

**IMPORTANTE**: Antes de executar, certifique-se de que:
1. O DNS está em modo DNS only no Cloudflare
2. O DNS está propagado e apontando para `191.96.81.68`

---

## 📋 Checklist Completo

- [ ] Desabilitar proxy do Cloudflare (modo DNS only)
- [ ] Aguardar propagação DNS (2-5 minutos)
- [ ] Verificar DNS: `dig +short cepa.angra.io` deve retornar `191.96.81.68`
- [ ] Parar Nginx e aplicação temporariamente
- [ ] Gerar certificado com `certbot certonly --standalone`
- [ ] Reiniciar serviços
- [ ] Configurar Nginx com `certbot --nginx`
- [ ] Testar acesso HTTPS
- [ ] (Opcional) Reativar proxy do Cloudflare se desejar

---

## 🔍 Verificações Adicionais

### Se o certificado já foi gerado parcialmente:

```bash
# Verificar certificados existentes
sudo certbot certificates

# Se houver certificado parcial, você pode tentar renovar:
sudo certbot renew --force-renewal -d cepa.angra.io
```

### Se precisar remover tentativas anteriores:

```bash
# Limpar certificados antigos
sudo rm -rf /etc/letsencrypt/live/cepa.angra.io
sudo rm -rf /etc/letsencrypt/archive/cepa.angra.io
sudo rm -rf /etc/letsencrypt/renewal/cepa.angra.io.conf
```

### Verificar logs do Let's Encrypt:

```bash
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

---

## 🚨 Troubleshooting

### Erro: "Invalid response from http://cepa.angra.io/.well-known/acme-challenge"

**Causa**: Cloudflare está bloqueando ou DNS não está apontando corretamente.

**Solução**: 
1. Desabilite o proxy do Cloudflare
2. Use modo standalone: `certbot certonly --standalone`

### Erro: "Connection refused"

**Causa**: Portas 80/443 não estão acessíveis publicamente.

**Solução**: Verifique port forwarding no roteador/firewall.

### Erro: "Domain not pointing to this server"

**Causa**: DNS ainda não propagou ou está apontando para lugar errado.

**Solução**: Aguarde mais tempo e verifique com `dig cepa.angra.io`

---

## 📞 Próximos Passos Após SSL Configurado

1. ✅ Testar acesso HTTPS: https://cepa.angra.io
2. ✅ Verificar renovação automática: `sudo certbot certificates`
3. ✅ (Opcional) Reativar proxy do Cloudflare se desejar
4. ✅ Compartilhar URL com usuários

---

**Última atualização**: $(date)
**IP do Servidor**: 191.96.81.68
**IP Interno**: 192.168.100.20
