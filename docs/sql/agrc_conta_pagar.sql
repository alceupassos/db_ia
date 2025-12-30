

--ALTER  view [dbo].[agrc_conta_pagar] as 

select
conta.clifor_codigo as Codigo_Cliente,
cliente_fornecedor.nome as Cliente, 
cidade.nome as Cidade,
cliente_fornecedor.uf_sigla as UF,
isnull(vnf.nome,vped.nome) as Nome_Vendedor,
nota_fiscal_venda.numero_nota as Numero_NF,
compra.numero_compra as Nota_Terceiro,
conta.codigo as Numero_Sequencial,
conta.numero_documento as Numero_documento,
parcela.codigo as Parcela,
parcela.data_emissao as Data_Emissao,
month (parcela.data_emissao) as Mes_Emissao,
year (parcela.data_emissao) as Ano_Emissao,
parcela.data_vencimento as Data_Vencimento,
month (parcela.data_vencimento) as Mes_Vencimento,
year (parcela.data_vencimento) as Ano_Vencimento,
parcela.data_quitacao as Data_Quitacao,
parcela.data_prev_pagamento as Data_previsao,
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
case
when pcc_nivel_3.codigo in (384,464,753,522,622,462,628,482,4,746,640,325,263) then 'Fornecedores'
when pcc_nivel_3.codigo in (285,658,664,613,741) then 'Imposto'
when pcc_nivel_3.codigo in (312,264) then 'Folha Pagamento'
when pcc_nivel_3.codigo in (432) then 'Emprestimos'
when pcc_nivel_3.codigo in (255) then 'Despesas Financeiras'
else 'Outras Despesas'
end 'plano_fuxo_caixa',
parcela.sit_codigo as id_situacao,

case parcela.sit_codigo 
	when 1 then 'Normal' 
	when 2 then 'Previsão'
	when 3 then 'Consolidado'
    when 4 then 'Provisão'
else null end as Situacao,
CONTA.observacao AS Observacao,
pcc_nivel_4.codigo as codigo_plano_contas,
conta.codigo as sequencial
 
from conta 
join parcela on parcela.cont_codigo = conta.codigo
join cliente_fornecedor on cliente_fornecedor.codigo = conta.clifor_codigo
left join cidade on cliente_fornecedor.cid_codigo = cidade.codigo
left join nota_fiscal_venda on conta.nf_codigo = nota_fiscal_venda.codigo
left join pedido on pedido.codigo = conta.ped_codigo
left join situacao_documento_receber on situacao_documento_receber.codigo = parcela.sit_codigo
left join apropriacao_despesa_receita on apropriacao_despesa_receita.cont_codigo = parcela.cont_codigo 
left join lancamento_financeiro on lancamento_financeiro.parc_cont_codigo = parcela.cont_codigo 
		  and lancamento_financeiro.parc_codigo = parcela.codigo
		
left join plano_conta pcc_nivel_4 on pcc_nivel_4.codigo = lancamento_financeiro.plan_codigo_debito -- nivel 4
left join plano_conta pcc_nivel_3 on pcc_nivel_3.codigo = pcc_nivel_4.plan_codigo -- nivel 3
left join plano_conta pcc_nivel_2 on pcc_nivel_2.codigo = pcc_nivel_3.plan_codigo -- nivel 2
left join plano_conta pcc_nivel_1 on pcc_nivel_1.codigo = pcc_nivel_2.plan_codigo -- nivel 1


		
left join plano_conta pcd_nivel_4 on pcd_nivel_4.codigo = apropriacao_despesa_receita.plan_codigo -- nivel 4
left join plano_conta pcd_nivel_3 on pcd_nivel_3.codigo = pcd_nivel_4.plan_codigo -- nivel 3
left join plano_conta pcd_nivel_2 on pcd_nivel_2.codigo = pcd_nivel_3.plan_codigo -- nivel 2
left join plano_conta pcd_nivel_1 on pcd_nivel_1.codigo = pcd_nivel_2.plan_codigo -- nivel 1

left join compra on compra.codigo = conta.comp_codigo
left join vendedor vnf on vnf.codigo = nota_fiscal_venda.vend_codigo
left join vendedor vped on vped.codigo = pedido.Vend_codigo
left join cobranca on cobranca.codigo = parcela.cob_codigo

where id_pagar_receber = 1
and parcela.cont_codigo_consolidada is null
and Conta.ind_movimento_banco is null


--union 

--Select 

--cheque_emitido.clifor_codigo as Codigo_Cliente,
--ISNULL (cliente_fornecedor.nome,'Vazio') as Cliente, 
--c.nome as Cidade,
--cliente_fornecedor.uf_sigla as UF,
--NULL as Nome_Vendedor,
--NULL as Numero_NF,
--NULL as Nota_Terceiro,
--NULL as Numero_Sequencial,
--NULL as Numero_documento,
--NULL as Parcela,
--cheque_emitido.data_emissao as Data_Emissao,
--month (cheque_emitido.data_emissao) as Mes_Emissao,
--year (cheque_emitido.data_emissao) as Ano_Emissao,
--cheque_emitido.bom_para as Data_Vencimento,
--month (cheque_emitido.bom_para) as Mes_Vencimento,
--year (cheque_emitido.bom_para) as Ano_Vencimento,
--cheque_emitido.data_compensacao as Data_Quitacao,
--month (cheque_emitido.data_compensacao) as Mes_Quitacao,
--year (cheque_emitido.data_compensacao) as Ano_Quitacao,
-- cheque_emitido.valor as Valor_Parcela,
-- 0 as Valor_Desconto, 
-- 0 as Valor_Acrescimo,
-- 'CHEQUES_EMITIDOS' as Forma_Cobranca,
-- NULL as Plano_Contas_Credito_Nivel_4,
-- NULL as Plano_Contas_Credito_Nivel_3,
-- NULL as Plano_Contas_Credito_Nivel_2,
--NULL  as Plano_Contas_Credito_Nivel_1,

-- NULL as Plano_Contas_Debito_Nivel_4,
-- NULL as Plano_Contas_Debito_Nivel_3,
-- NULL as Plano_Contas_Debito_Nivel_2,
-- NULL as Plano_Contas_Debito_Nivel_1,
-- null as 'plano_fuxo_caixa',
--'Normal' as Situacao

--from 
--sgc.dbo.cheque_emitido 
--left join sgc.dbo.cliente_fornecedor on cheque_emitido.clifor_codigo = cliente_fornecedor.codigo 
--join sgc.dbo.banco on cheque_emitido.banc_codigo = banco.codigo 
--left join cidade c on c.codigo = cliente_fornecedor.cid_codigo
--where 
--cheque_emitido.id_situacao in (1, 2) 
--GO


GO


