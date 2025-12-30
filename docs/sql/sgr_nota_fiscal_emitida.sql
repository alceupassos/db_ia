
--CREATE VIEW [dbo].[sgr_nota_fiscal_emitida] AS

	select 
	nota_fiscal_venda.numero_nota as Numero_Nota,
	case 	
	(case isnull(nota_fiscal_venda.id_situacao_nfe, nota_fiscal_venda.situacao) 
		when (3) then nota_fiscal_venda.situacao 
		when (5) then nota_fiscal_venda.situacao 
		when (6) then nota_fiscal_venda.situacao 
		else isnull(nota_fiscal_venda.id_situacao_nfe, nota_fiscal_venda.situacao) 
	end) 
	when (1) then 'Emitida'
	when (2) then 'Impressa'
	when (3) then 'Cancelada'
	when (4) then 'Transmitida'
	when (5) then 'Denegada'
	when (6) then 'Cancelada'
	when (7) then 'Denegada'
	when (8) then 'inutilizada'
	end 	
	as Situacao
	,cliente_fornecedor.codigo as Codigo_Cliente
	,cliente_fornecedor.nome as Cliente
    ,cliente_fornecedor.cnpj as CNPJ_CPF
	,cliente_fornecedor.inscricao as Inscricao_Estadual
	,cliente_fornecedor.inscricao_municipal as Inscricao_Municipal
	,cliente_fornecedor.tipo_logradouro as Tipo_Logradouro
	,cliente_fornecedor.logradouro as Logradouro
	,cliente_fornecedor.numero as Numero
	,cliente_fornecedor.complemento as Complemento
	,cliente_fornecedor.bairro as Bairro
	,regiao.nome as Regiao
	,cliente_fornecedor.ddd_telefone1 as DDD
	,cliente_fornecedor.telefone1 as Telefone 
	,nota_fiscal_venda.data as Data_Emissao 
	,day(nota_fiscal_venda.data) as Dia
	,month(nota_fiscal_venda.data) as Mes_Data_Emissao
	,year(nota_fiscal_venda.data) as Ano_Data_Emissao
	,nota_fiscal_venda.data_saida as Data_Saida 
	,tipo_nota_fiscal.nome as Tipo_de_Nota
	,case tipo_nota_fiscal.ind_venda 
		when 1 then 'Venda'
		when 2 then 'Devolução'
		when 3 then 'Bonificação'
		else 'Outras' 
		end as Tipo_Nota_Operacao
	,case when tipo_nota_fiscal.ind_faturamento =1 
	then 'SIM'
	ELSE 'NAO'
	end Gera_Faturamento
	,vendedor.nome as Vendedor
	,atendente.nome as Atendente
	,condicao_pagamento.nome as Condicao_de_Pagamento
	,cobranca.nome as Forma_de_Cobranca
	,case sgc.dbo.produto.id_classificacao
	 	when 0 then 'Referência'
		when 1 then 'Genérico'
		when 2 then 'Similar'
		when 3 then 'Outros' end as Categoria_Medicamento
	,case sgc.dbo.produto.id_lista_pis_cofins 
		when 2 then 'Negativa'
		when 1 then 'Positiva'
		when 3 then 'Neutra' 
		end as Lista_Pis_Cofins
	,produto.codigo as Codigo_Produto
	,produto.nome as Produto
	,nota_fiscal_venda_item_lote.lote_numero as Lote_Numero
	,fabricante.nome as Fabricante
	,produto.classificacao_fiscal as NCM
	,produto.peso_bruto as Peso_Bruto
	,produto.preco_custo_real as Preco_Custo_Real_Produto 
	,produto.preco_custo Preco_Custo
	,produto.preco_custo_medio Preco_Custo_Medio
	,nota_fiscal_venda_item.cfop_codigo as CFOP
	,PRODUTO.unid_unidade as Unidade
	,nota_fiscal_venda_item.codigo_cst as CST 
	,nota_fiscal_venda_item.margem_valor_agregado as MVA
	,round(nota_fiscal_venda_item.valor_base_calculo_icms / nota_fiscal_venda_item.quantidade * (isnull(nota_fiscal_venda_item_lote.quantidade,nota_fiscal_venda_item.quantidade)),2) as Base_ICMS
	,round(nota_fiscal_venda_item.valor_icms  / nota_fiscal_venda_item.quantidade * (isnull(nota_fiscal_venda_item_lote.quantidade,nota_fiscal_venda_item.quantidade)),2) as Valor_ICMS 
	,round(nota_fiscal_venda_item.valor_base_calculo_icms_substituicao  / nota_fiscal_venda_item.quantidade * (isnull(nota_fiscal_venda_item_lote.quantidade,nota_fiscal_venda_item.quantidade)),2) as Base_ICMS_ST
	,round(nota_fiscal_venda_item.valor_substituicao_tributaria  / nota_fiscal_venda_item.quantidade * (isnull(nota_fiscal_venda_item_lote.quantidade,nota_fiscal_venda_item.quantidade)),2) as Valor_ICMS_ST
	,isnull(nota_fiscal_venda_item_lote.quantidade,nota_fiscal_venda_item.quantidade) as Quantidade 
	,convert(decimal(12,4),nota_fiscal_venda_item.valor_unitario) as Valor_Unitario 
	,
	CASE 
	when  tipo_nota_fiscal.ind_venda <> 2 then
	(isnull(nota_fiscal_venda_item_lote.quantidade,nota_fiscal_venda_item.quantidade))* (convert(decimal(12,4),nota_fiscal_venda_item.valor_unitario))
	else (isnull(nota_fiscal_venda_item_lote.quantidade,nota_fiscal_venda_item.quantidade))* (convert(decimal(12,4),nota_fiscal_venda_item.valor_unitario)) *-1 
	
	end 'Valor_Total_Item' 
	,convert(decimal(12,4),
	isnull(nota_fiscal_venda_item_lote.quantidade,nota_fiscal_venda_item.quantidade) * 
		   (Convert(decimal(12,4),nota_fiscal_venda_item.valor_unitario)) / 		   
	isnull(nullif((select sum(isnull(nlote.quantidade,nitem.quantidade) * 
		   (Convert(decimal(12,4),nitem.valor_unitario))) 
	 from nota_fiscal_venda_item nitem 
	 left join nota_fiscal_venda_item_lote nlote on nitem.nf_numero = nlote.nfit_nf_numero and nitem.codigo = nlote.nfit_codigo
	 where nitem.nf_numero = nota_fiscal_venda_item.nf_numero),0),1) 
	 * nota_fiscal_venda.valor_desconto_acrescimo
	 * (select case nota_fiscal_venda.id_desconto_acrescimo when 1 then -1 else 1 end)) as Rateio_Desc_Acres 
	,
	CASE 

	when  tipo_nota_fiscal.ind_venda <> 2 then

	(isnull(nota_fiscal_venda_item_lote.quantidade,nota_fiscal_venda_item.quantidade) * 
		   (Convert(decimal(12,4),nota_fiscal_venda_item.valor_unitario))) + 
	(convert(decimal(12,4),
			isnull(nota_fiscal_venda_item_lote.quantidade,nota_fiscal_venda_item.quantidade) * 
		   (Convert(decimal(12,4),nota_fiscal_venda_item.valor_unitario)) / 		   
	isnull(nullif((select sum(isnull(nlote.quantidade,nitem.quantidade) * 
		   (Convert(decimal(12,4),nitem.valor_unitario))) 
	 from nota_fiscal_venda_item nitem 
	 left join nota_fiscal_venda_item_lote nlote on nitem.nf_numero = nlote.nfit_nf_numero and nitem.codigo = nlote.nfit_codigo
	 where nitem.nf_numero = nota_fiscal_venda_item.nf_numero),0),1) 
	 * nota_fiscal_venda.valor_desconto_acrescimo
	 * (select case nota_fiscal_venda.id_desconto_acrescimo when 1 then -1 else 1 end)))

	 when  tipo_nota_fiscal.ind_venda = 2 then 

	 ((isnull(nota_fiscal_venda_item_lote.quantidade,nota_fiscal_venda_item.quantidade) * 
		   (Convert(decimal(12,4),nota_fiscal_venda_item.valor_unitario))) + 
	(convert(decimal(12,4),
			isnull(nota_fiscal_venda_item_lote.quantidade,nota_fiscal_venda_item.quantidade) * 
		   (Convert(decimal(12,4),nota_fiscal_venda_item.valor_unitario)) / 		   
	isnull(nullif((select sum(isnull(nlote.quantidade,nitem.quantidade) * 
		   (Convert(decimal(12,4),nitem.valor_unitario))) 
	 from nota_fiscal_venda_item nitem 
	 left join nota_fiscal_venda_item_lote nlote on nitem.nf_numero = nlote.nfit_nf_numero and nitem.codigo = nlote.nfit_codigo
	 where nitem.nf_numero = nota_fiscal_venda_item.nf_numero),0),1) 
	 * nota_fiscal_venda.valor_desconto_acrescimo
	 * (select case nota_fiscal_venda.id_desconto_acrescimo when 1 then -1 else 1 end))))*-1

	 end Valor_Total_Unit_com_Desc_Acresc 

	,CASE nota_fiscal_venda.id_desconto_acrescimo 
		WHEN 2 	THEN (nota_fiscal_venda_item.valor_total + 
						isnull(nota_fiscal_venda_item.valor_desc_acresc_rateio_sintegra, 0)    
						+ isNull(nota_fiscal_venda_item.valor_substituicao_tributaria, 0) 
						+ isNull(nota_fiscal_venda_item.valor_icms_substituicao_reembolso_rateio, 0) 
						+ isNull(nota_fiscal_venda_item.valor_despesa_acessoria_rateio,0) 
						+ isNull(nota_fiscal_venda_item.valor_ipi, 0)) 
						* (isnull(nota_fiscal_venda_item_lote.quantidade,nota_fiscal_venda_item.quantidade) / nota_fiscal_venda_item.quantidade)
				ELSE (nota_fiscal_venda_item.valor_total - 
						isnull(nota_fiscal_venda_item.valor_desc_acresc_rateio_sintegra, 0) 
						+ isNull(nota_fiscal_venda_item.valor_substituicao_tributaria, 0) 
						+ isNull(nota_fiscal_venda_item.valor_icms_substituicao_reembolso_rateio, 0) 
						+ isNull(nota_fiscal_venda_item.valor_despesa_acessoria_rateio,0) 
						+ isNull(nota_fiscal_venda_item.valor_ipi, 0)) 
						* (isnull(nota_fiscal_venda_item_lote.quantidade,nota_fiscal_venda_item.quantidade) / nota_fiscal_venda_item.quantidade) END as Valor_Total_Rel_Estrategico  
	,nota_fiscal_venda.valor_frete as Valor_Frete 
	,case isnull(nota_fiscal_venda.id_frete,'')
	      when (1) then 'CIF'                  
	      when (2) then 'FOB'                  
	 end as Tipo_frete
	,nota_fiscal_venda.quantidade_volume as Quantidade_Total_Volumes
	,nota_fiscal_venda.especie_volume as Tipo_Volumes
	,cidade.nome as Cidade
	,cidade.uf_sigla as UF_Sigla
	,Transp.nome as Transportadora
	,CC3.nome as Classificacao_Cliente
	,claspro.nome as Classificacao_Produto
	,(select sum(isnull(comissao_vendedor,0)) from comissao_venda_nota_fiscal cns where cns.nf_codigo = nota_fiscal_venda.codigo and cns.comissao_vendedor >=0) as Comissoes
	,produto.codigo_fabricante as Codigo_Fabricante_Produto
	,case tipo_nota_fiscal.id_tipo_operacao 
		  when 1 then 'Entrada'
		  when 2 then 'Saída'
		  when 3 then 'Outros'
		  else null end as Operacao,
	Case
	when nota_fiscal_venda_item.Unidade <> produto.unid_unidade then nota_fiscal_venda_item_lote.quantidade * puc.multiplicador
	when nota_fiscal_venda_item_lote.quantidade is null then nota_fiscal_venda_item .quantidade
	else nota_fiscal_venda_item_lote.quantidade
	end Quantidade_convertida,
	pd.codigo as pedido,
	isnull(isnull(cc1.nome,cc2.nome),cc3.nome) as 'classificacao_nv1',
	case 
	when cc1.nome is null then cc3.nome
	else cc2.nome 
	end  'Classificacao_nv2',
	cp2.nome as 'Familia',
	'Matriz' as 'Empresa'
from sgc.dbo.nota_fiscal_venda 
					join sgc.dbo.nota_fiscal_venda_item on nota_fiscal_venda_item.nf_numero = nota_fiscal_venda.codigo
					join sgc.dbo.produto on produto.codigo = nota_fiscal_venda_item.prod_codigo
					join sgc.dbo.fabricante on fabricante.codigo = produto.fabr_codigo
					join sgc.dbo.cliente_fornecedor on cliente_fornecedor.codigo = nota_fiscal_venda.clifor_codigo
					join sgc.dbo.tipo_nota_fiscal on tipo_nota_fiscal.codigo = nota_fiscal_venda.tiponf_codigo
				left join sgc.dbo.nota_fiscal_venda_item_lote on (sgc.dbo.nota_fiscal_venda_item.nf_numero = sgc.dbo.nota_fiscal_venda_item_lote.nfit_nf_numero
        				and sgc.dbo.nota_fiscal_venda_item.codigo = sgc.dbo.nota_fiscal_venda_item_lote.nfit_codigo)
				left join sgc.dbo.vendedor on vendedor.codigo = nota_fiscal_venda.vend_codigo
				left join sgc.dbo.condicao_pagamento on condicao_pagamento.codigo = nota_fiscal_venda.condpg_codigo
				left join sgc.dbo.cobranca on cobranca.codigo = nota_fiscal_venda.cob_codigo
				left join sgc.dbo.cidade on cidade.codigo = cliente_fornecedor.cid_codigo
				left join sgc.dbo.regiao on regiao.codigo = cliente_fornecedor.regi_codigo
				left join sgc.dbo.cliente_fornecedor as Transp on Transp.codigo = nota_fiscal_venda.tran_codigo
				left join sgc.dbo.classificacao_cliente as CC3 on CC3.codigo = cliente_fornecedor.clascli_codigo_1
				left join sgc.dbo.classificacao_produto as claspro on claspro.codigo = produto.claspro_codigo_1
				left join sgc.dbo.produto_unidade_conversao puc on puc.prod_codigo = nota_fiscal_venda_item.prod_codigo and puc.unidade_convertida = nota_fiscal_venda_item.unidade 
				left join sgc.dbo.vendedor atendente on atendente.codigo = cliente_fornecedor.vend_codigo_2
				left join sgc.dbo.nota_fiscal_venda_item_pedido_item nfpd on nfpd.nfit_nf_numero = nota_fiscal_venda_item.nf_numero and nfpd.nfit_codigo = nota_fiscal_venda_item.codigo
				left join sgc.dbo.pedido pd on pd.codigo = nfpd.pedit_ped_codigo
				left join sgc.dbo.classificacao_cliente cc2 on cc2.codigo = cc3.clascli_codigo
				left join sgc.dbo.classificacao_cliente cc1 on cc1.codigo = cc2.clascli_codigo
				left join sgc.dbo.classificacao_produto cp2 on cp2.codigo = produto.claspro_codigo_2
where 1=1	
and (case when sgc.dbo.nota_fiscal_venda.codigo in (select distinct pnf.nf_codigo from sgc.dbo.pedido_nota_fiscal pnf 
									join sgc.dbo.pedido on pedido.codigo = pnf.ped_codigo 
									join sgc.dbo.tipo_pedido tp on tp.codigo = sgc.dbo.pedido.tipoped_codigo and tp.id_acao_consignacao = 2) 
	then 2 else nota_fiscal_venda.id_entrada_saida end) in (1,2) 	
and isnull(sgc.dbo.nota_fiscal_venda.ind_nota_complemento_icms,0) = 0		 
and nota_fiscal_venda_item.quantidade > 0
and tipo_nota_fiscal.ind_venda <>2



	
union all


select 
	nota_fiscal_venda.numero_nota as Numero_Nota,
	case 	
	(case isnull(nota_fiscal_venda.id_situacao_nfe, nota_fiscal_venda.situacao) 
		when (3) then nota_fiscal_venda.situacao 
		when (5) then nota_fiscal_venda.situacao 
		when (6) then nota_fiscal_venda.situacao 
		else isnull(nota_fiscal_venda.id_situacao_nfe, nota_fiscal_venda.situacao) 
	end) 
	when (1) then 'Emitida'
	when (2) then 'Impressa'
	when (3) then 'Cancelada'
	when (4) then 'Transmitida'
	when (5) then 'Denegada'
	when (6) then 'Cancelada'
	when (7) then 'Denegada'
	when (8) then 'inutilizada'
	end 	
	as Situacao
	,cliente_fornecedor.codigo as Codigo_Cliente
	,cliente_fornecedor.nome as Cliente
    ,cliente_fornecedor.cnpj as CNPJ_CPF
	,cliente_fornecedor.inscricao as Inscricao_Estadual
	,cliente_fornecedor.inscricao_municipal as Inscricao_Municipal
	,cliente_fornecedor.tipo_logradouro as Tipo_Logradouro
	,cliente_fornecedor.logradouro as Logradouro
	,cliente_fornecedor.numero as Numero
	,cliente_fornecedor.complemento as Complemento
	,cliente_fornecedor.bairro as Bairro
	,regiao.nome as Regiao
	,cliente_fornecedor.ddd_telefone1 as DDD
	,cliente_fornecedor.telefone1 as Telefone 
	,nota_fiscal_venda.data as Data_Emissao 
	,day(nota_fiscal_venda.data) as Dia
	,month(nota_fiscal_venda.data) as Mes_Data_Emissao
	,year(nota_fiscal_venda.data) as Ano_Data_Emissao
	,nota_fiscal_venda.data_saida as Data_Saida 
	,tipo_nota_fiscal.nome as Tipo_de_Nota
	,case tipo_nota_fiscal.ind_venda 
		when 1 then 'Venda'
		when 2 then 'Devolução'
		when 3 then 'Bonificação'
		else 'Outras' 
		end as Tipo_Nota_Operacao
	,case when tipo_nota_fiscal.ind_faturamento =1 
	then 'SIM'
	ELSE 'NAO'
	end Gera_Faturamento
	,vendedor.nome as Vendedor
	,atendente.nome as Atendente
	,condicao_pagamento.nome as Condicao_de_Pagamento
	,cobranca.nome as Forma_de_Cobranca
	,case sgc2.dbo.produto.id_classificacao
	 	when 0 then 'Referência'
		when 1 then 'Genérico'
		when 2 then 'Similar'
		when 3 then 'Outros' end as Categoria_Medicamento
	,case sgc2.dbo.produto.id_lista_pis_cofins 
		when 2 then 'Negativa'
		when 1 then 'Positiva'
		when 3 then 'Neutra' 
		end as Lista_Pis_Cofins
	,produto.codigo as Codigo_Produto
	,produto.nome as Produto
	,nota_fiscal_venda_item_lote.lote_numero as Lote_Numero
	,fabricante.nome as Fabricante
	,produto.classificacao_fiscal as NCM
	,produto.peso_bruto as Peso_Bruto
	,produto.preco_custo_real as Preco_Custo_Real_Produto 
	,produto.preco_custo Preco_Custo
	,produto.preco_custo_medio Preco_Custo_Medio
	,nota_fiscal_venda_item.cfop_codigo as CFOP
	,produto.unid_unidade as Unidade
	,nota_fiscal_venda_item.codigo_cst as CST 
	,nota_fiscal_venda_item.margem_valor_agregado as MVA
	,round(nota_fiscal_venda_item.valor_base_calculo_icms / nota_fiscal_venda_item.quantidade * (isnull(nota_fiscal_venda_item_lote.quantidade,nota_fiscal_venda_item.quantidade)),2) as Base_ICMS
	,round(nota_fiscal_venda_item.valor_icms  / nota_fiscal_venda_item.quantidade * (isnull(nota_fiscal_venda_item_lote.quantidade,nota_fiscal_venda_item.quantidade)),2) as Valor_ICMS 
	,round(nota_fiscal_venda_item.valor_base_calculo_icms_substituicao  / nota_fiscal_venda_item.quantidade * (isnull(nota_fiscal_venda_item_lote.quantidade,nota_fiscal_venda_item.quantidade)),2) as Base_ICMS_ST
	,round(nota_fiscal_venda_item.valor_substituicao_tributaria  / nota_fiscal_venda_item.quantidade * (isnull(nota_fiscal_venda_item_lote.quantidade,nota_fiscal_venda_item.quantidade)),2) as Valor_ICMS_ST
	,isnull(nota_fiscal_venda_item_lote.quantidade,nota_fiscal_venda_item.quantidade) as Quantidade 
	,convert(decimal(12,4),nota_fiscal_venda_item.valor_unitario) as Valor_Unitario 
	,
	CASE 
	when  tipo_nota_fiscal.ind_venda <> 2 then
	(isnull(nota_fiscal_venda_item_lote.quantidade,nota_fiscal_venda_item.quantidade))* (convert(decimal(12,4),nota_fiscal_venda_item.valor_unitario))
	else (isnull(nota_fiscal_venda_item_lote.quantidade,nota_fiscal_venda_item.quantidade))* (convert(decimal(12,4),nota_fiscal_venda_item.valor_unitario)) *-1 
	
	end 'Valor_Total_Item' 
	,convert(decimal(12,4),
	isnull(nota_fiscal_venda_item_lote.quantidade,nota_fiscal_venda_item.quantidade) * 
		   (Convert(decimal(12,4),nota_fiscal_venda_item.valor_unitario)) / 		   
	isnull(nullif((select sum(isnull(nlote.quantidade,nitem.quantidade) * 
		   (Convert(decimal(12,4),nitem.valor_unitario))) 
	 from nota_fiscal_venda_item nitem 
	 left join nota_fiscal_venda_item_lote nlote on nitem.nf_numero = nlote.nfit_nf_numero and nitem.codigo = nlote.nfit_codigo
	 where nitem.nf_numero = nota_fiscal_venda_item.nf_numero),0),1) 
	 * nota_fiscal_venda.valor_desconto_acrescimo
	 * (select case nota_fiscal_venda.id_desconto_acrescimo when 1 then -1 else 1 end)) as Rateio_Desc_Acres 
	,
	CASE 

	when  tipo_nota_fiscal.ind_venda <> 2 then

	(isnull(nota_fiscal_venda_item_lote.quantidade,nota_fiscal_venda_item.quantidade) * 
		   (Convert(decimal(12,4),nota_fiscal_venda_item.valor_unitario))) + 
	(convert(decimal(12,4),
			isnull(nota_fiscal_venda_item_lote.quantidade,nota_fiscal_venda_item.quantidade) * 
		   (Convert(decimal(12,4),nota_fiscal_venda_item.valor_unitario)) / 		   
	isnull(nullif((select sum(isnull(nlote.quantidade,nitem.quantidade) * 
		   (Convert(decimal(12,4),nitem.valor_unitario))) 
	 from nota_fiscal_venda_item nitem 
	 left join nota_fiscal_venda_item_lote nlote on nitem.nf_numero = nlote.nfit_nf_numero and nitem.codigo = nlote.nfit_codigo
	 where nitem.nf_numero = nota_fiscal_venda_item.nf_numero),0),1) 
	 * nota_fiscal_venda.valor_desconto_acrescimo
	 * (select case nota_fiscal_venda.id_desconto_acrescimo when 1 then -1 else 1 end)))

	 when  tipo_nota_fiscal.ind_venda = 2 then 

	 ((isnull(nota_fiscal_venda_item_lote.quantidade,nota_fiscal_venda_item.quantidade) * 
		   (Convert(decimal(12,4),nota_fiscal_venda_item.valor_unitario))) + 
	(convert(decimal(12,4),
			isnull(nota_fiscal_venda_item_lote.quantidade,nota_fiscal_venda_item.quantidade) * 
		   (Convert(decimal(12,4),nota_fiscal_venda_item.valor_unitario)) / 		   
	isnull(nullif((select sum(isnull(nlote.quantidade,nitem.quantidade) * 
		   (Convert(decimal(12,4),nitem.valor_unitario))) 
	 from nota_fiscal_venda_item nitem 
	 left join nota_fiscal_venda_item_lote nlote on nitem.nf_numero = nlote.nfit_nf_numero and nitem.codigo = nlote.nfit_codigo
	 where nitem.nf_numero = nota_fiscal_venda_item.nf_numero),0),1) 
	 * nota_fiscal_venda.valor_desconto_acrescimo
	 * (select case nota_fiscal_venda.id_desconto_acrescimo when 1 then -1 else 1 end))))*-1

	 end Valor_Total_Unit_com_Desc_Acresc 

	,CASE nota_fiscal_venda.id_desconto_acrescimo 
		WHEN 2 	THEN (nota_fiscal_venda_item.valor_total + 
						isnull(nota_fiscal_venda_item.valor_desc_acresc_rateio_sintegra, 0)    
						+ isNull(nota_fiscal_venda_item.valor_substituicao_tributaria, 0) 
						+ isNull(nota_fiscal_venda_item.valor_icms_substituicao_reembolso_rateio, 0) 
						+ isNull(nota_fiscal_venda_item.valor_despesa_acessoria_rateio,0) 
						+ isNull(nota_fiscal_venda_item.valor_ipi, 0)) 
						* (isnull(nota_fiscal_venda_item_lote.quantidade,nota_fiscal_venda_item.quantidade) / nota_fiscal_venda_item.quantidade)
				ELSE (nota_fiscal_venda_item.valor_total - 
						isnull(nota_fiscal_venda_item.valor_desc_acresc_rateio_sintegra, 0) 
						+ isNull(nota_fiscal_venda_item.valor_substituicao_tributaria, 0) 
						+ isNull(nota_fiscal_venda_item.valor_icms_substituicao_reembolso_rateio, 0) 
						+ isNull(nota_fiscal_venda_item.valor_despesa_acessoria_rateio,0) 
						+ isNull(nota_fiscal_venda_item.valor_ipi, 0)) 
						* (isnull(nota_fiscal_venda_item_lote.quantidade,nota_fiscal_venda_item.quantidade) / nota_fiscal_venda_item.quantidade) END as Valor_Total_Rel_Estrategico  
	,nota_fiscal_venda.valor_frete as Valor_Frete 
	,case isnull(nota_fiscal_venda.id_frete,'')
	      when (1) then 'CIF'                  
	      when (2) then 'FOB'                  
	 end as Tipo_frete
	,nota_fiscal_venda.quantidade_volume as Quantidade_Total_Volumes
	,nota_fiscal_venda.especie_volume as Tipo_Volumes
	,cidade.nome as Cidade
	,cidade.uf_sigla as UF_Sigla
	,Transp.nome as Transportadora
	,cc3.nome as Classificacao_Cliente
	,claspro.nome as Classificacao_Produto
	,(select sum(isnull(comissao_vendedor,0)) from comissao_venda_nota_fiscal cns where cns.nf_codigo = nota_fiscal_venda.codigo and cns.comissao_vendedor >=0) as Comissoes
	,produto.codigo_fabricante as Codigo_Fabricante_Produto
	,case tipo_nota_fiscal.id_tipo_operacao 
		  when 1 then 'Entrada'
		  when 2 then 'Saída'
		  when 3 then 'Outros'
		  else null end as Operacao,
	Case
	when nota_fiscal_venda_item.Unidade <> produto.unid_unidade then nota_fiscal_venda_item_lote.quantidade * puc.multiplicador
	when nota_fiscal_venda_item_lote.quantidade is null then nota_fiscal_venda_item .quantidade
	else nota_fiscal_venda_item_lote.quantidade
	end Quantidade_convertida,
	pd.codigo as pedido,
	isnull(isnull(cc1.nome,cc2.nome),cc3.nome) as 'classificacao_nv1',
	case 
	when cc1.nome is null then cc3.nome
	else cc2.nome 
	end  'Classificacao_nv2',
	cp2.nome as 'Familia',
	'Filial' as 'Empresa'
from sgc2.dbo.nota_fiscal_venda 
					join sgc2.dbo.nota_fiscal_venda_item on nota_fiscal_venda_item.nf_numero = nota_fiscal_venda.codigo
					join sgc2.dbo.produto on produto.codigo = nota_fiscal_venda_item.prod_codigo
					join sgc2.dbo.fabricante on fabricante.codigo = produto.fabr_codigo
					join sgc2.dbo.cliente_fornecedor on cliente_fornecedor.codigo = nota_fiscal_venda.clifor_codigo
					join sgc2.dbo.tipo_nota_fiscal on tipo_nota_fiscal.codigo = nota_fiscal_venda.tiponf_codigo
				left join sgc2.dbo.nota_fiscal_venda_item_lote on (sgc2.dbo.nota_fiscal_venda_item.nf_numero = sgc2.dbo.nota_fiscal_venda_item_lote.nfit_nf_numero
        				and sgc2.dbo.nota_fiscal_venda_item.codigo = sgc2.dbo.nota_fiscal_venda_item_lote.nfit_codigo)
				left join sgc2.dbo.vendedor on vendedor.codigo = nota_fiscal_venda.vend_codigo
				left join sgc2.dbo.condicao_pagamento on condicao_pagamento.codigo = nota_fiscal_venda.condpg_codigo
				left join sgc2.dbo.cobranca on cobranca.codigo = nota_fiscal_venda.cob_codigo
				left join sgc2.dbo.cidade on cidade.codigo = cliente_fornecedor.cid_codigo
				left join sgc2.dbo.regiao on regiao.codigo = cliente_fornecedor.regi_codigo
				left join sgc2.dbo.cliente_fornecedor as Transp on Transp.codigo = nota_fiscal_venda.tran_codigo
				left join sgc2.dbo.classificacao_cliente as CC3 on cc3.codigo = cliente_fornecedor.clascli_codigo_1
				left join sgc2.dbo.classificacao_produto as claspro on claspro.codigo = produto.claspro_codigo_1
				left join sgc2.dbo.produto_unidade_conversao puc on puc.prod_codigo = nota_fiscal_venda_item.prod_codigo and puc.unidade_convertida = nota_fiscal_venda_item.unidade 
				left join sgc2.dbo.vendedor atendente on atendente.codigo = cliente_fornecedor.vend_codigo_2
				left join sgc2.dbo.nota_fiscal_venda_item_pedido_item nfpd on nfpd.nfit_nf_numero = nota_fiscal_venda_item.nf_numero and nfpd.nfit_codigo = nota_fiscal_venda_item.codigo
				left join sgc2.dbo.pedido pd on pd.codigo = nfpd.pedit_ped_codigo
				left join sgc2.dbo.classificacao_cliente cc2 on cc2.codigo = cc3.clascli_codigo
				left join sgc2.dbo.classificacao_cliente cc1 on cc1.codigo = cc2.clascli_codigo
				left join sgc2.dbo.classificacao_produto cp2 on cp2.codigo = produto.claspro_codigo_2

where 1=1	
and (case when sgc2.dbo.nota_fiscal_venda.codigo in (select distinct pnf.nf_codigo from sgc2.dbo.pedido_nota_fiscal pnf 
									join sgc2.dbo.pedido on pedido.codigo = pnf.ped_codigo 
									join sgc2.dbo.tipo_pedido tp on tp.codigo = sgc2.dbo.pedido.tipoped_codigo and tp.id_acao_consignacao = 2) 
	then 2 else nota_fiscal_venda.id_entrada_saida end) in (1,2) 	
and isnull(sgc2.dbo.nota_fiscal_venda.ind_nota_complemento_icms,0) = 0		 
and nota_fiscal_venda_item.quantidade > 0
and tipo_nota_fiscal.ind_venda <>2

union all

	

	select 
    tab.Numero_Nota,
    tab.Situacao,
    tab.Codigo_Cliente,
    tab.Cliente,
    tab.CNPJ_CPF,
    tab.Inscricao_Estadual,
    tab.Inscricao_Municipal,
    tab.Tipo_Logradouro,
    tab.Logradouro,
    tab.Numero,
    tab.Complemento,
    tab.Bairro,
    tab.Regiao,
    tab.DDD,
    tab.Telefone,
    tab.Data_Emissao,
    tab.Dia,
    tab.Mes_Data_Emissao,
    tab.Ano_Data_Emissao,
    tab.Data_Saida,
    tab.Tipo_de_Nota,
    tab.Tipo_Nota_Operacao,
    tab.Gera_Faturamento,
    tab.Vendedor,
    tab.Atendente,
    tab.Condicao_de_Pagamento,
    tab.Forma_de_Cobranca,
    tab.Categoria_Medicamento,
    tab.Lista_Pis_Cofins,
    tab.Codigo_Produto,
    tab.Produto,
    tab.Lote_Numero,
    tab.Fabricante,
    tab.NCM,
    tab.Peso_Bruto,
    tab.Preco_Custo_Real_Produto,
    tab.Preco_Custo,
    tab.Preco_Custo_Medio,
    tab.CFOP,
    tab.Unidade,
    tab.CST,
    tab.MVA,
    tab.Base_ICMS,
    tab.Valor_ICMS,
    tab.Base_ICMS_ST,
    tab.Valor_ICMS_ST,
    tab.Quantidade,
    tab.Valor_Unitario,
    tab.Valor_Total_Item,
    tab.Rateio_Desc_Acres,
    tab.Valor_Total_Unit_com_Desc_Acresc,
    tab.Valor_Total_Rel_Estrategico,
    tab.Valor_Frete,
    tab.Tipo_frete,
    tab.Quantidade_Total_Volumes,
    tab.Tipo_Volumes,
    tab.Cidade,
    tab.UF_Sigla,
    tab.Transportadora,
    tab.Classificacao_Cliente,
    tab.Classificacao_Produto,
    tab.Comissoes,
    tab.Codigo_Fabricante_Produto,
    tab.Operacao,
    tab.Quantidade_convertida,
   -- tab.Tipo_emissao,
    tab.pedido,
	isnull(isnull(cc1.nome,cc2.nome),cc3.nome) as 'classificacao_nv1',
	case 
	when cc1.nome is null then cc3.nome
	else cc2.nome 
	end  'Classificacao_nv2',
	Familia,
	tab.Empresa

from (

select
distinct
dv.numero_nota_devolucao as	'Numero_Nota',
'Transmitida' as 'Situacao',
ISNULL(CF.codigo,CF2.codigo) as 'Codigo_Cliente',
ISNULL(CF.NOME,CF2.NOME) as 'Cliente',
ISNULL(CF.cnpj,CF2.cnpj) as 'CNPJ_CPF',
ISNULL(CF.inscricao,CF2.inscricao) as 'Inscricao_Estadual',
ISNULL(CF.inscricao_municipal,CF2.inscricao_municipal) as 'Inscricao_Municipal',
ISNULL(CF.tipo_logradouro,CF2.tipo_logradouro) as 'Tipo_Logradouro',
ISNULL(CF.logradouro,CF2.logradouro) as 'Logradouro',
ISNULL(CF.numero,CF2.numero) as 'Numero',
ISNULL(CF.complemento,CF2.complemento) as 'Complemento',
ISNULL(CF.bairro,CF2.bairro) as 'Bairro',
ISNULL(r.nome,r2.nome) as 'Regiao',
ISNULL(CF.ddd_telefone1,CF2.ddd_telefone1) as 'DDD',
ISNULL(CF.telefone1,CF2.telefone1) as 'Telefone',
dv.data_emissao as 'Data_Emissao',
DAY (dv.data_emissao) as 'Dia',
MONTH(dv.data_emissao) as 'Mes_Data_Emissao',
YEAR (dv.data_emissao) as 'Ano_Data_Emissao',
dv.data_emissao as 'Data_Saida',
'Devolução' as 'Tipo_de_Nota',
'Devolução' as 'Tipo_Nota_Operacao',
'Não' as 'Gera_Faturamento',
dv.vendedor as 'Vendedor',
ad.nome as 'Atendente',
'Devolução' as 'Condicao_de_Pagamento',
'Devolução' as 'Forma_de_Cobranca',
'' as 'Categoria_Medicamento',
'' as 'Lista_Pis_Cofins',
dv.prod_codigo as 'Codigo_Produto',
dv.produto as 'Produto',
dv.lote_numero as 'Lote_Numero',
f.nome as 'Fabricante',
p.classificacao_fiscal as 'NCM',
'' as 'Peso_Bruto',
dv.valor_unitario as 'Preco_Custo_Real_Produto',
dv.valor_unitario as 'Preco_Custo',
dv.valor_unitario as 'Preco_Custo_Medio',
'' as 'CFOP',
P.unid_unidade as 'Unidade',
'' as 'CST',
'' as 'MVA',
'' as 'Base_ICMS',
'' as 'Valor_ICMS',
'' as 'Base_ICMS_ST',
'' as 'Valor_ICMS_ST',
dv.qtd_devolvida as 'Quantidade',
dv.valor_unitario *-1 as 'Valor_Unitario',
dv.vr_total * -1 as 'Valor_Total_Item',
'0' as 'Rateio_Desc_Acres',
dv.vr_total * -1  as 'Valor_Total_Unit_com_Desc_Acresc',
dv.vr_total * -1  as 'Valor_Total_Rel_Estrategico',
'' as 'Valor_Frete',
'' as 'Tipo_frete',
'' as 'Quantidade_Total_Volumes',
'' as 'Tipo_Volumes',
isnull(cd.nome,cd2.nome) as 'Cidade',
isnull (cf.uf_sigla,cf2.uf_sigla) as 'UF_Sigla',
'' as 'Transportadora',
isnull (cc3.nome,cc32.nome) as 'Classificacao_Cliente',
'' as 'Classificacao_Produto',
'' as 'Comissoes',
'' as 'Codigo_Fabricante_Produto',
'Devolução' as 'Operacao',

Case
When dv.unidade <> p.unid_unidade then (dv.qtd_devolvida * puc.multiplicador)*-1
else (dv.qtd_devolvida)*-1
end 'Quantidade_convertida',

--Case
--when dv.unidade <> p.unid_unidade then isnull(nfvi.quantidade,ci.quantidade) * isnull(puc.multiplicador,puc.multiplicador)
--when isnull (nfvi.quantidade,ci.quantidade) is null then isnull(nfvi.quantidade,ci.quantidade)
--else isnull (nfvi.quantidade,ci.quantidade)
--end 'Quantidade_convertida',
dv.Tipo_emissao,
'' as 'pedido',
Isnull(cc1.nome,cc12.nome) as 'classificacao_nv1',
Isnull(cc2.nome,cc22.nome) as 'Classificacao_nv2',
cp2.nome as 'Familia',
dv.Empresa as 'Empresa'


from sgrp_devolucao dv
LEFT JOIN sgc.dbo.nota_fiscal_venda nf on nf.codigo = dv.nf_codigo_dev
LEFT JOIN sgc.dbo.nota_fiscal_venda_item nfvi on nfvi.nf_numero = nf.codigo
LEFT JOIN sgc.dbo.compra c on c.codigo = dv.nf_codigo_dev
LEFT JOIN sgc.dbo.compra_item ci on ci.comp_codigo = c.codigo
LEFT JOIN sgc.dbo.cliente_fornecedor cf on cf.codigo = nf.clifor_codigo
LEFT JOIN sgc.dbo.classificacao_cliente as CC3 on CC3.codigo = cf.clascli_codigo_1
LEFT JOIN sgc.dbo.classificacao_cliente cc2 on cc2.codigo = cc3.clascli_codigo
LEFT JOIN sgc.dbo.classificacao_cliente cc1 on cc1.codigo = cc2.clascli_codigo
LEFT JOIN sgc.dbo.cliente_fornecedor cf2 on cf2.codigo  = c.clifor_codigo
LEFT JOIN sgc.dbo.classificacao_cliente as CC32 on CC3.codigo = cf2.clascli_codigo_1
LEFT JOIN sgc.dbo.classificacao_cliente cc22 on cc22.codigo = cc32.clascli_codigo
LEFT JOIN sgc.dbo.classificacao_cliente cc12 on cc12.codigo = cc22.clascli_codigo
LEFT JOIN sgc.dbo.regiao r on r.codigo = cf.regi_codigo
LEFT JOIN sgc.dbo.regiao r2 on r2.codigo = cf2.regi_codigo
LEFT JOIN sgc.dbo.produto p on p.codigo = dv.prod_codigo
LEFT JOIN sgc.dbo.fabricante f on f.codigo = p.fabr_codigo
LEFT JOIN sgc.dbo.produto_unidade_conversao puc on puc.prod_codigo = dv.prod_codigo and puc.unidade_convertida = dv.unidade 
left join sgc.dbo.classificacao_produto cp2 on cp2.codigo = p.claspro_codigo_2
LEFT JOIN sgc.dbo.cidade cd on cd.codigo = cf.cid_codigo
LEFT JOIN sgc.dbo.cidade cd2 on cd2.codigo = cf2.cid_codigo
left join sgc.dbo.vendedor vd on vd.codigo = cf.vend_codigo
left join sgc.dbo.vendedor ad on ad.codigo = cf.vend_codigo_2


where empresa = 'Matriz'
) tab
left join sgc.dbo.cliente_fornecedor cf on cf.codigo = tab.codigo_cliente
left join sgc.dbo.classificacao_cliente CC3 on CC3.codigo = cf.clascli_codigo_1
left join sgc.dbo.classificacao_cliente cc2 on cc2.codigo = cc3.clascli_codigo
left join sgc.dbo.classificacao_cliente cc1 on cc1.codigo = cc2.clascli_codigo


Union all

select 
    tab.Numero_Nota,
    tab.Situacao,
    tab.Codigo_Cliente,
    tab.Cliente,
    tab.CNPJ_CPF,
    tab.Inscricao_Estadual,
    tab.Inscricao_Municipal,
    tab.Tipo_Logradouro,
    tab.Logradouro,
    tab.Numero,
    tab.Complemento,
    tab.Bairro,
    tab.Regiao,
    tab.DDD,
    tab.Telefone,
    tab.Data_Emissao,
    tab.Dia,
    tab.Mes_Data_Emissao,
    tab.Ano_Data_Emissao,
    tab.Data_Saida,
    tab.Tipo_de_Nota,
    tab.Tipo_Nota_Operacao,
    tab.Gera_Faturamento,
    tab.Vendedor,
    tab.Atendente,
    tab.Condicao_de_Pagamento,
    tab.Forma_de_Cobranca,
    tab.Categoria_Medicamento,
    tab.Lista_Pis_Cofins,
    tab.Codigo_Produto,
    tab.Produto,
    tab.Lote_Numero,
    tab.Fabricante,
    tab.NCM,
    tab.Peso_Bruto,
    tab.Preco_Custo_Real_Produto,
    tab.Preco_Custo,
    tab.Preco_Custo_Medio,
    tab.CFOP,
    tab.Unidade,
    tab.CST,
    tab.MVA,
    tab.Base_ICMS,
    tab.Valor_ICMS,
    tab.Base_ICMS_ST,
    tab.Valor_ICMS_ST,
    tab.Quantidade,
    tab.Valor_Unitario,
    tab.Valor_Total_Item,
    tab.Rateio_Desc_Acres,
    tab.Valor_Total_Unit_com_Desc_Acresc,
    tab.Valor_Total_Rel_Estrategico,
    tab.Valor_Frete,
    tab.Tipo_frete,
    tab.Quantidade_Total_Volumes,
    tab.Tipo_Volumes,
    tab.Cidade,
    tab.UF_Sigla,
    tab.Transportadora,
    tab.Classificacao_Cliente,
    tab.Classificacao_Produto,
    tab.Comissoes,
    tab.Codigo_Fabricante_Produto,
    tab.Operacao,
    tab.Quantidade_convertida,
  --  tab.Tipo_emissao,
    tab.pedido,
	isnull(isnull(cc1.nome,cc2.nome),cc3.nome) as 'classificacao_nv1',
	case 
	when cc1.nome is null then cc3.nome
	else cc2.nome 
	end  'Classificacao_nv2',
	Familia,
	tab.Empresa

from (

select
distinct
dv.numero_nota_devolucao as	'Numero_Nota',
'Transmitida' as 'Situacao',
ISNULL(CF.codigo,CF2.codigo) as 'Codigo_Cliente',
ISNULL(CF.NOME,CF2.NOME) as 'Cliente',
ISNULL(CF.cnpj,CF2.cnpj) as 'CNPJ_CPF',
ISNULL(CF.inscricao,CF2.inscricao) as 'Inscricao_Estadual',
ISNULL(CF.inscricao_municipal,CF2.inscricao_municipal) as 'Inscricao_Municipal',
ISNULL(CF.tipo_logradouro,CF2.tipo_logradouro) as 'Tipo_Logradouro',
ISNULL(CF.logradouro,CF2.logradouro) as 'Logradouro',
ISNULL(CF.numero,CF2.numero) as 'Numero',
ISNULL(CF.complemento,CF2.complemento) as 'Complemento',
ISNULL(CF.bairro,CF2.bairro) as 'Bairro',
ISNULL(r.nome,r2.nome) as 'Regiao',
ISNULL(CF.ddd_telefone1,CF2.ddd_telefone1) as 'DDD',
ISNULL(CF.telefone1,CF2.telefone1) as 'Telefone',
dv.data_emissao as 'Data_Emissao',
DAY (dv.data_emissao) as 'Dia',
MONTH(dv.data_emissao) as 'Mes_Data_Emissao',
YEAR (dv.data_emissao) as 'Ano_Data_Emissao',
dv.data_emissao as 'Data_Saida',
'Devolução' as 'Tipo_de_Nota',
'Devolução' as 'Tipo_Nota_Operacao',
'Não' as 'Gera_Faturamento',
dv.vendedor as 'Vendedor',
ad.nome as 'Atendente',
'Devolução' as 'Condicao_de_Pagamento',
'Devolução' as 'Forma_de_Cobranca',
'' as 'Categoria_Medicamento',
'' as 'Lista_Pis_Cofins',
dv.prod_codigo as 'Codigo_Produto',
dv.produto as 'Produto',
dv.lote_numero as 'Lote_Numero',
f.nome as 'Fabricante',
p.classificacao_fiscal as 'NCM',
'' as 'Peso_Bruto',
dv.valor_unitario as 'Preco_Custo_Real_Produto',
dv.valor_unitario as 'Preco_Custo',
dv.valor_unitario as 'Preco_Custo_Medio',
'' as 'CFOP',
P.unid_unidade as 'Unidade',
'' as 'CST',
'' as 'MVA',
'' as 'Base_ICMS',
'' as 'Valor_ICMS',
'' as 'Base_ICMS_ST',
'' as 'Valor_ICMS_ST',
dv.qtd_devolvida as 'Quantidade',
dv.valor_unitario *-1 as 'Valor_Unitario',
dv.vr_total * -1 as 'Valor_Total_Item',
'0' as 'Rateio_Desc_Acres',
dv.vr_total * -1  as 'Valor_Total_Unit_com_Desc_Acresc',
dv.vr_total * -1  as 'Valor_Total_Rel_Estrategico',
'' as 'Valor_Frete',
'' as 'Tipo_frete',
'' as 'Quantidade_Total_Volumes',
'' as 'Tipo_Volumes',
isnull(cd.nome,cd2.nome) as 'Cidade',
isnull (cf.uf_sigla,cf2.uf_sigla) as 'UF_Sigla',
'' as 'Transportadora',
isnull (cc3.nome,cc32.nome) as 'Classificacao_Cliente',
'' as 'Classificacao_Produto',
'' as 'Comissoes',
'' as 'Codigo_Fabricante_Produto',
'Devolução' as 'Operacao',

Case
When dv.unidade <> p.unid_unidade then (dv.qtd_devolvida * puc.multiplicador)*-1
else (dv.qtd_devolvida)*-1
end 'Quantidade_convertida',

--Case
--when dv.unidade <> p.unid_unidade then isnull(nfvi.quantidade,ci.quantidade) * isnull(puc.multiplicador,puc.multiplicador)
--when isnull (nfvi.quantidade,ci.quantidade) is null then isnull(nfvi.quantidade,ci.quantidade)
--else isnull (nfvi.quantidade,ci.quantidade)
--end 'Quantidade_convertida',
dv.Tipo_emissao,
'' as 'pedido',
Isnull(cc1.nome,cc12.nome) as 'classificacao_nv1',
Isnull(cc2.nome,cc22.nome) as 'Classificacao_nv2',
cp2.nome as 'Familia',
dv.Empresa as 'Empresa'

from sgrp_devolucao dv
LEFT JOIN sgc2.dbo.nota_fiscal_venda nf on nf.codigo = dv.nf_codigo_dev
LEFT JOIN sgc2.dbo.nota_fiscal_venda_item nfvi on nfvi.nf_numero = nf.codigo
LEFT JOIN sgc2.dbo.compra c on c.codigo = dv.nf_codigo_dev
LEFT JOIN sgc2.dbo.compra_item ci on ci.comp_codigo = c.codigo
LEFT JOIN sgc2.dbo.cliente_fornecedor cf on cf.codigo = nf.clifor_codigo
LEFT JOIN sgc2.dbo.classificacao_cliente as CC3 on CC3.codigo = cf.clascli_codigo_1
LEFT JOIN sgc2.dbo.classificacao_cliente cc2 on cc2.codigo = cc3.clascli_codigo
LEFT JOIN sgc2.dbo.classificacao_cliente cc1 on cc1.codigo = cc2.clascli_codigo
LEFT JOIN sgc2.dbo.cliente_fornecedor cf2 on cf2.codigo  = c.clifor_codigo
LEFT JOIN sgc2.dbo.classificacao_cliente as CC32 on CC3.codigo = cf2.clascli_codigo_1
LEFT JOIN sgc2.dbo.classificacao_cliente cc22 on cc22.codigo = cc32.clascli_codigo
LEFT JOIN sgc2.dbo.classificacao_cliente cc12 on cc12.codigo = cc22.clascli_codigo
LEFT JOIN sgc2.dbo.regiao r on r.codigo = cf.regi_codigo
LEFT JOIN sgc2.dbo.regiao r2 on r2.codigo = cf2.regi_codigo
LEFT JOIN sgc2.dbo.produto p on p.codigo = dv.prod_codigo
LEFT JOIN sgc2.dbo.fabricante f on f.codigo = p.fabr_codigo
LEFT JOIN sgc2.dbo.produto_unidade_conversao puc on puc.prod_codigo = dv.prod_codigo and puc.unidade_convertida = dv.unidade 
left join sgc2.dbo.classificacao_produto cp2 on cp2.codigo = p.claspro_codigo_2
LEFT JOIN sgc2.dbo.cidade cd on cd.codigo = cf.cid_codigo
LEFT JOIN sgc2.dbo.cidade cd2 on cd2.codigo = cf2.cid_codigo
left join sgc2.dbo.vendedor vd on vd.codigo = cf.vend_codigo
left join sgc2.dbo.vendedor ad on ad.codigo = cf.vend_codigo_2


where empresa = 'filial'
) tab
left join sgc2.dbo.cliente_fornecedor cf on cf.codigo = tab.codigo_cliente
left join sgc2.dbo.classificacao_cliente CC3 on CC3.codigo = cf.clascli_codigo_1
left join sgc2.dbo.classificacao_cliente cc2 on cc2.codigo = cc3.clascli_codigo
left join sgc2.dbo.classificacao_cliente cc1 on cc1.codigo = cc2.clascli_codigo



GO


