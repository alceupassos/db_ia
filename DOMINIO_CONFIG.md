# Configuração do Domínio cepa.angra.io

## ✅ Status da Configuração

- ✅ Nginx instalado e configurado como proxy reverso
- ✅ Certbot instalado para SSL
- ✅ Aplicação rodando na porta 3001
- ✅ Proxy reverso funcionando corretamente
- ⏳ **Aguardando configuração DNS** para gerar certificado SSL

## 📋 Como Apontar o Domínio cepa.angra.io

### Informações Importantes

- **IP Público do VPS**: `191.96.81.68`
- **IP Interno**: `192.168.100.20`
- **Porta da Aplicação**: `3001` (proxy reverso via Nginx na porta 80/443)

### Passo 1: Configurar DNS

No seu provedor de domínio (onde `angra.io` está registrado), crie o seguinte registro DNS:

| Tipo | Nome | Valor | TTL |
|------|------|-------|-----|
| **A** | `cepa` | `191.96.81.68` | `3600` |

**Ou**, se estiver usando configuração de zona DNS:

```
cepa.angra.io.    IN    A    191.96.81.68
```

### Passo 2: Configurar Port Forwarding (se necessário)

Se o VPS está atrás de um firewall/roteador, configure o port forwarding:

| Porta Externa | IP Interno | Porta Interna | Protocolo |
|---------------|------------|---------------|-----------|
| 80 | 192.168.100.20 | 80 | TCP |
| 443 | 192.168.100.20 | 443 | TCP |

### Passo 3: Verificar Propagação DNS

Após configurar o DNS, aguarde alguns minutos e verifique se está funcionando:

```bash
# Verificar resolução DNS
dig cepa.angra.io +short
# Deve retornar: 191.96.81.68

# Ou usando nslookup
nslookup cepa.angra.io
# Deve retornar: 191.96.81.68
```

### Passo 4: Gerar Certificado SSL

**IMPORTANTE**: Só execute este passo **DEPOIS** que o DNS estiver propagado e o domínio estiver acessível.

Conecte no VPS e execute:

```bash
ssh cepalab@192.168.100.20
# Senha: abc123..

# Gerar certificado SSL
sudo certbot --nginx -d cepa.angra.io

# Durante o processo, o Certbot vai:
# 1. Verificar que você controla o domínio
# 2. Gerar o certificado SSL
# 3. Atualizar automaticamente a configuração do Nginx para HTTPS
# 4. Configurar renovação automática
```

O Certbot irá automaticamente:
- Atualizar a configuração do Nginx para incluir SSL
- Redirecionar HTTP para HTTPS
- Configurar renovação automática do certificado

### Passo 5: Verificar Certificado SSL

Após gerar o certificado, teste se está funcionando:

```bash
# Testar acesso HTTPS
curl -I https://cepa.angra.io

# Verificar certificado
openssl s_client -connect cepa.angra.io:443 -servername cepa.angra.io < /dev/null 2>/dev/null | openssl x509 -noout -dates
```

## 🔒 Renovação Automática do SSL

O Certbot já está configurado para renovar automaticamente os certificados. O timer do systemd está ativo:

```bash
# Verificar status do timer
sudo systemctl status certbot.timer

# Ver próximas renovações
sudo systemctl list-timers certbot.timer
```

## 🌐 Acesso Final

Após concluir todos os passos:

- **URL HTTP**: http://cepa.angra.io (redirecionará para HTTPS)
- **URL HTTPS**: https://cepa.angra.io ✅
- **Login**: `juridico@cepalab.com.br`
- **Senha**: `juridico123`

## 📝 Configuração Atual do Nginx

A configuração temporária (HTTP) está em:
- `/etc/nginx/sites-available/cepa.angra.io`
- `/etc/nginx/sites-enabled/cepa.angra.io`

Após executar o Certbot, a configuração será automaticamente atualizada para incluir SSL.

## 🛠️ Comandos Úteis

```bash
# Ver logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Testar configuração do Nginx
sudo nginx -t

# Recarregar Nginx (após mudanças)
sudo systemctl reload nginx

# Reiniciar Nginx
sudo systemctl restart nginx

# Ver status do Certbot
sudo certbot certificates

# Renovar certificado manualmente (se necessário)
sudo certbot renew

# Ver status da aplicação
pm2 list
pm2 logs cepalab-juridico
```

## ❓ Troubleshooting

### DNS não está propagando?

1. Aguarde até 24-48 horas (geralmente é mais rápido)
2. Verifique se o registro DNS está correto
3. Limpe o cache DNS local: `sudo systemd-resolve --flush-caches`

### Certificado SSL não está sendo gerado?

1. Verifique se o domínio está resolvendo corretamente: `dig cepa.angra.io`
2. Verifique se as portas 80 e 443 estão acessíveis publicamente
3. Verifique se o firewall não está bloqueando: `sudo ufw status`

### Erro "Connection refused" ao acessar o domínio?

1. Verifique se o Nginx está rodando: `sudo systemctl status nginx`
2. Verifique se a aplicação está rodando: `pm2 list`
3. Verifique se as portas estão abertas: `sudo netstat -tlnp | grep :80`

## 📞 Próximos Passos

1. ✅ Configure o DNS no seu provedor
2. ✅ Aguarde a propagação DNS (alguns minutos)
3. ✅ Execute o Certbot para gerar o SSL
4. ✅ Teste o acesso via HTTPS
5. ✅ Compartilhe a URL com os usuários

---

**Data da Configuração**: $(date)
**IP Público**: 191.96.81.68
**Status**: ⏳ Aguardando configuração DNS
