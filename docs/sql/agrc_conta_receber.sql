

--CREATE  view [dbo].[agrc_conta_receber] as 

select
conta.clifor_codigo as Codigo_Cliente,
cliente_fornecedor.nome as Cliente, 
cliente_fornecedor.cnpj as CPF_CNPJ,
cidade.nome as Cidade,
cliente_fornecedor.uf_sigla as UF,
isnull(vnf.nome,vped.nome) as Nome_vendedor,
nota_fiscal_venda.numero_nota as Numero_NF,
conta.ped_codigo as Numero_Pedido,
conta.codigo as Numero_Sequencial,
conta.numero_documento as Numero_Documento,
parcela.codigo as Parcela,
parcela.data_emissao as Data_Emissao,
month (parcela.data_emissao) as Mes_Emissao,
year (parcela.data_emissao) as Ano_Emissao,
parcela.data_vencimento as Data_Vencimento,
parcela.data_prev_pagamento as Data_previsao,
month (parcela.data_vencimento) as Mes_Vencimento,
year (parcela.data_vencimento) as Ano_Vencimento,
parcela.data_quitacao as Data_Quitacao,
month (parcela.data_quitacao) as Mes_Quitacao,
year (parcela.data_quitacao) as Ano_Quitacao,
parcela.valor as Valor_Parcela,
parcela.desconto as Valor_Desconto, 
parcela.acrescimo as Valor_Acrescimo,
cobranca.nome as Forma_Cobranca,

pcc_nivel_4.nome as Plano_Contas_Credito_Nivel_4,
pcc_nivel_3.nome as Plano_Contas_Credito_Nivel_3,
pcc_nivel_2.nome as Plano_Contas_Credito_Nivel_2,
pcc_nivel_1.nome as Plano_Contas_Credito_Nivel_1,

pcd_nivel_4.nome as Plano_Contas_Debito_Nivel_4,
pcd_nivel_3.nome as Plano_Contas_Debito_Nivel_3,
pcd_nivel_2.nome as Plano_Contas_Debito_Nivel_2,
pcd_nivel_1.nome as Plano_Contas_Debito_Nivel_1,
parcela.sit_codigo as id_situacao,
case parcela.sit_codigo 
	when 1 then 'Normal' 
	when 2 then 'Previsão'
	when 3 then 'Consolidado'
	when 4 then 'Provisao'
else null end as Situacao_documento,
parcela.nosso_numero as Nosso_Numero,
conta.observacao,
cc.nome as classificacao,
'Matriz' as 'Empresa',

--case 
--when conta.nf_codigo in (select
--nf_codigo
--from pedido_nota_fiscal
--where ped_codigo in (

--select
--codigo
--from pedido
--where observacao like '%comissão%'
--and observacao like '%80%')) then 1
--else 0 
--end ind_compartilhada,
tnf.nome as Tipo_NF

from sgc.dbo.conta conta 
join sgc.dbo.parcela on parcela.cont_codigo = conta.codigo
join sgc.dbo.cliente_fornecedor on cliente_fornecedor.codigo = conta.clifor_codigo
left join sgc.dbo.cidade on cliente_fornecedor.cid_codigo = cidade.codigo
left join sgc.dbo.nota_fiscal_venda on conta.nf_codigo = nota_fiscal_venda.codigo
left join sgc.dbo.pedido on pedido.codigo = conta.ped_codigo
left join sgc.dbo.situacao_documento_receber on situacao_documento_receber.codigo = parcela.sit_codigo
left join sgc.dbo.lancamento_financeiro on lancamento_financeiro.parc_cont_codigo = parcela.cont_codigo 
		  and sgc.dbo.lancamento_financeiro.parc_codigo = parcela.codigo
		  and sgc.dbo.lancamento_financeiro.codigo = (select min(codigo) from sgc.dbo.lancamento_financeiro 
		  where parc_cont_codigo = sgc.dbo.parcela.cont_codigo and parc_codigo = parcela.codigo) 
		  /* adicionada esta linha em virtude de duplicidade de registro dos lançamentos com juros*/

left join sgc.dbo.plano_conta pcc_nivel_4 on pcc_nivel_4.codigo = lancamento_financeiro.plan_codigo_credito -- nivel 4
left join sgc.dbo.plano_conta pcc_nivel_3 on pcc_nivel_3.codigo = pcc_nivel_4.plan_codigo -- nivel 3
left join sgc.dbo.plano_conta pcc_nivel_2 on pcc_nivel_2.codigo = pcc_nivel_3.plan_codigo -- nivel 2
left join sgc.dbo.plano_conta pcc_nivel_1 on pcc_nivel_1.codigo = pcc_nivel_2.plan_codigo -- nivel 1

left join sgc.dbo.plano_conta pcd_nivel_4 on pcd_nivel_4.codigo = lancamento_financeiro.plan_codigo_debito -- nivel 4
left join sgc.dbo.plano_conta pcd_nivel_3 on pcd_nivel_3.codigo = pcd_nivel_4.plan_codigo -- nivel 3
left join sgc.dbo.plano_conta pcd_nivel_2 on pcd_nivel_2.codigo = pcd_nivel_3.plan_codigo -- nivel 2
left join sgc.dbo.plano_conta pcd_nivel_1 on pcd_nivel_1.codigo = pcd_nivel_2.plan_codigo -- nivel 1

left join sgc.dbo.vendedor vnf on vnf.codigo = nota_fiscal_venda.vend_codigo
left join sgc.dbo.vendedor vped on vped.codigo = pedido.Vend_codigo
left join sgc.dbo.cobranca on cobranca.codigo = parcela.cob_codigo
left join sgc.dbo.classificacao_cliente cc on cc.codigo = cliente_fornecedor.clascli_codigo_1
left join sgc.dbo.tipo_nota_fiscal tnf on tnf.codigo = nota_fiscal_venda.tiponf_codigo

where id_pagar_receber = 2
and parcela.cont_codigo_consolidada is null
and Conta.ind_movimento_banco is null



union all 

select
conta.clifor_codigo as Codigo_Cliente,
cliente_fornecedor.nome as Cliente, 
cliente_fornecedor.cnpj as CPF_CNPJ,
cidade.nome as Cidade,
cliente_fornecedor.uf_sigla as UF,
isnull(vnf.nome,vped.nome) as Nome_vendedor,
nota_fiscal_venda.numero_nota as Numero_NF,
conta.ped_codigo as Numero_Pedido,
conta.codigo as Numero_Sequencial,
conta.numero_documento as Numero_Documento,
parcela.codigo as Parcela,
parcela.data_emissao as Data_Emissao,
month (parcela.data_emissao) as Mes_Emissao,
year (parcela.data_emissao) as Ano_Emissao,
parcela.data_vencimento as Data_Vencimento,
parcela.data_prev_pagamento as Data_previsao,
month (parcela.data_vencimento) as Mes_Vencimento,
year (parcela.data_vencimento) as Ano_Vencimento,
parcela.data_quitacao as Data_Quitacao,
month (parcela.data_quitacao) as Mes_Quitacao,
year (parcela.data_quitacao) as Ano_Quitacao,
parcela.valor as Valor_Parcela,
parcela.desconto as Valor_Desconto, 
parcela.acrescimo as Valor_Acrescimo,
cobranca.nome as Forma_Cobranca,

pcc_nivel_4.nome as Plano_Contas_Credito_Nivel_4,
pcc_nivel_3.nome as Plano_Contas_Credito_Nivel_3,
pcc_nivel_2.nome as Plano_Contas_Credito_Nivel_2,
pcc_nivel_1.nome as Plano_Contas_Credito_Nivel_1,

pcd_nivel_4.nome as Plano_Contas_Debito_Nivel_4,
pcd_nivel_3.nome as Plano_Contas_Debito_Nivel_3,
pcd_nivel_2.nome as Plano_Contas_Debito_Nivel_2,
pcd_nivel_1.nome as Plano_Contas_Debito_Nivel_1,
parcela.sit_codigo as id_situacao,
case parcela.sit_codigo 
	when 1 then 'Normal' 
	when 2 then 'Previsão'
	when 3 then 'Consolidado'
	when 4 then 'Provisao'
else null end as Situacao_documento,
parcela.nosso_numero as Nosso_Numero,
conta.observacao,
cc.nome as classificacao,
'Filial' as Empresa,
tnf.nome as Tipo_NF

from sgc2.dbo.conta conta 
join sgc2.dbo.parcela on parcela.cont_codigo = conta.codigo
join sgc2.dbo.cliente_fornecedor on cliente_fornecedor.codigo = conta.clifor_codigo
left join sgc2.dbo.cidade on cliente_fornecedor.cid_codigo = cidade.codigo
left join sgc2.dbo.nota_fiscal_venda on conta.nf_codigo = nota_fiscal_venda.codigo
left join sgc2.dbo.pedido on pedido.codigo = conta.ped_codigo
left join sgc2.dbo.situacao_documento_receber on situacao_documento_receber.codigo = parcela.sit_codigo
left join sgc2.dbo.lancamento_financeiro on lancamento_financeiro.parc_cont_codigo = parcela.cont_codigo 
		  and sgc2.dbo.lancamento_financeiro.parc_codigo = parcela.codigo
		  and sgc2.dbo.lancamento_financeiro.codigo = (select min(codigo) from sgc2.dbo.lancamento_financeiro 
		  where parc_cont_codigo = sgc2.dbo.parcela.cont_codigo and parc_codigo = parcela.codigo) 
		  /* adicionada esta linha em virtude de duplicidade de registro dos lançamentos com juros*/

left join sgc2.dbo.plano_conta pcc_nivel_4 on pcc_nivel_4.codigo = lancamento_financeiro.plan_codigo_credito -- nivel 4
left join sgc2.dbo.plano_conta pcc_nivel_3 on pcc_nivel_3.codigo = pcc_nivel_4.plan_codigo -- nivel 3
left join sgc2.dbo.plano_conta pcc_nivel_2 on pcc_nivel_2.codigo = pcc_nivel_3.plan_codigo -- nivel 2
left join sgc2.dbo.plano_conta pcc_nivel_1 on pcc_nivel_1.codigo = pcc_nivel_2.plan_codigo -- nivel 1

left join sgc2.dbo.plano_conta pcd_nivel_4 on pcd_nivel_4.codigo = lancamento_financeiro.plan_codigo_debito -- nivel 4
left join sgc2.dbo.plano_conta pcd_nivel_3 on pcd_nivel_3.codigo = pcd_nivel_4.plan_codigo -- nivel 3
left join sgc2.dbo.plano_conta pcd_nivel_2 on pcd_nivel_2.codigo = pcd_nivel_3.plan_codigo -- nivel 2
left join sgc2.dbo.plano_conta pcd_nivel_1 on pcd_nivel_1.codigo = pcd_nivel_2.plan_codigo -- nivel 1

left join sgc2.dbo.vendedor vnf on vnf.codigo = nota_fiscal_venda.vend_codigo
left join sgc2.dbo.vendedor vped on vped.codigo = pedido.Vend_codigo
left join sgc2.dbo.cobranca on cobranca.codigo = parcela.cob_codigo
left join sgc2.dbo.classificacao_cliente cc on cc.codigo = cliente_fornecedor.clascli_codigo_1
left join sgc2.dbo.tipo_nota_fiscal tnf on tnf.codigo = nota_fiscal_venda.tiponf_codigo

where id_pagar_receber = 2
and parcela.cont_codigo_consolidada is null
and Conta.ind_movimento_banco is null
GO


