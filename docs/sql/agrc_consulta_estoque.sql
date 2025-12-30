


--ALTER  view [dbo].[agrc_consulta_estoque] as 

select
Codigo_Produto,
produto,
Lote,
Data_Validade,
Lote_codigo,
Lote_validade as 'Lote/validade',
SUM (bhz) as 'BHZ',
SUM(estoque) as 'Estoque',
SUM(ag_chegada) as 'AG Chegada',
classificacao,
Fabricante as 'Fabricante',
origem as 'Origem',
ncm as 'NCM',
case
when p.ind_materia_prima = 1 then 'Materia Prima'
else 'Produto'
end 'ind_prod_mateira',
Puc.multiplicador as multiplicador


from (

SELECT
    p.Codigo_Produto AS 'Codigo_Produto',
    p.Produto AS 'Produto',
    ISNULL (p.Lote,'') AS 'Lote',
	isnull(convert (varchar, p.Validade,103),'') as 'Data_Validade',
    ISNULL(p.Lote_Codigo,'') AS 'Lote_codigo',
	concat( ISNULL(p.Lote,''), ' - ', isnull(convert (varchar, p.Validade,103),'')) as 'Lote_validade',
    0 AS BHZ,
  --  ISNULL(p.Quantidade_Estoque_Lote, 0) AS Estoque,
    CASE 
        WHEN p.Quantidade_Estoque_Lote < 0 THEN 0
        WHEN p.Quantidade_Estoque_Lote IS NULL THEN 0
        ELSE p.Quantidade_Estoque_Lote
    END AS 'Estoque',
    0 AS 'AG_Chegada',
	isnull(p.Classificacao_Produto,'') as 'classificacao',
	f.nome as 'Fabricante',
  case pd.id_origem
	when 1 then '0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8'
	when 2 then '1 - Estrangeira – Importação direta, exceto a indicada no código 6'
	when 3 then '2 - Estrangeira – Adquirida no mercado interno, exceto a indicada no código 7'
	when 4 then '3 - Nacional, mercadoria ou bem com Conteúdo de Importação superior a 40% e inferior ou igual a 70%'
	when 5 then '4 - Nacional, cuja produção tenha sido feita em conformidade com os processos produtivos básicos'
	when 6 then '5 - Nacional, mercadoria ou bem com Conteúdo de Importação inferior ou igual a 40%'
	when 7 then '6 - Estrangeira – Importação direta, sem similar nacional, constante em lista de Resolução CAMEX'
	when 8 then '7 - Estrangeira – Adquirida no mercado interno, sem similar nacional, constante em lista de Resolução CAMEX'
	when 9 then '8 -  Nacional, mercadoria ou bem com Conteúdo de Importação superior a 70%'
       end as Origem,
	   pd.classificacao_fiscal as 'NCM'
FROM sgr_estoque_lote p 
LEFT JOIN produto pd on pd.codigo = p.Codigo_Produto
LEFT JOIN classificacao_produto cp on cp.codigo = pd.claspro_codigo_1
LEFT JOIN fabricante f on f.codigo = pd.fabr_codigo

	union all

	SELECT
    ebh.Codigo_Produto AS 'Codigo_Produto',
    ebh.Produto AS 'Produto',
    ISNULL(ebh.Numero_Lote,'') AS 'Lote',
	isnull(ebh.Data_Validade,'') as 'Data_Validade',
    ISNULL(ebh.Lote_Codigo,'') AS 'Lote_codigo',
	concat(
		ISNULL(ebh.Numero_Lote COLLATE Latin1_General_CI_AS, ''), 
		' - ', 
		ISNULL(ebh.Data_Validade COLLATE Latin1_General_CI_AS, '')
	) as 'Lote_validade',
    ISNULL(ebh.Saldo, 0) AS BHZ,
  --  ISNULL(p.Quantidade_Estoque_Lote, 0) AS Estoque,
    0 AS 'Estoque',
    0 AS 'AG_Chegada',
	cp.nome as 'classificacao',
	f.nome as 'Fabricante',
  case pd.id_origem
	when 1 then '0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8'
	when 2 then '1 - Estrangeira – Importação direta, exceto a indicada no código 6'
	when 3 then '2 - Estrangeira – Adquirida no mercado interno, exceto a indicada no código 7'
	when 4 then '3 - Nacional, mercadoria ou bem com Conteúdo de Importação superior a 40% e inferior ou igual a 70%'
	when 5 then '4 - Nacional, cuja produção tenha sido feita em conformidade com os processos produtivos básicos'
	when 6 then '5 - Nacional, mercadoria ou bem com Conteúdo de Importação inferior ou igual a 40%'
	when 7 then '6 - Estrangeira – Importação direta, sem similar nacional, constante em lista de Resolução CAMEX'
	when 8 then '7 - Estrangeira – Adquirida no mercado interno, sem similar nacional, constante em lista de Resolução CAMEX'
	when 9 then '8 -  Nacional, mercadoria ou bem com Conteúdo de Importação superior a 70%'
       end as Origem,
	   pd.classificacao_fiscal as 'NCM'
FROM sgrp_saldo_bhz ebh 
LEFT JOIN produto pd on pd.codigo = ebh.Codigo_produto
LEFT JOIN classificacao_produto cp on cp.codigo = pd.claspro_codigo_1
LEFT JOIN fabricante f on f.codigo = pd.fabr_codigo

)tab

LEFT JOIN produto p on p.codigo = tab.Codigo_Produto
LEFT JOIN PRODUTO_UNIDADE_CONVERSAO Puc ON Puc.prod_codigo = p.codigo AND puc.unidade_convertida = 'UN'
group by Codigo_Produto,produto,Lote,Data_Validade,Lote_codigo,lote_validade,classificacao, Fabricante, origem, NCM, p.ind_materia_prima,Puc.multiplicador


UNION all 

SELECT
    codigo_produto AS 'Codigo_Produto',
    produto AS 'Produto',
    '' AS 'Lote',  -- Aplicando a collation explícita aqui
	Previsao AS 'Data_Validade',
    '' AS 'Lote_codigo',
	concat( 'Previsão ' , Previsao COLLATE Latin1_General_CI_AS) as 'Lote/validade',
    0 AS 'BHZ',
    0 AS 'Estoque',
    Quantidade AS 'AG chegada',
	cp.nome as 'classificacao',
	f.nome as 'Fabricante',
  case p.id_origem
	when 1 then '0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8'
	when 2 then '1 - Estrangeira – Importação direta, exceto a indicada no código 6'
	when 3 then '2 - Estrangeira – Adquirida no mercado interno, exceto a indicada no código 7'
	when 4 then '3 - Nacional, mercadoria ou bem com Conteúdo de Importação superior a 40% e inferior ou igual a 70%'
	when 5 then '4 - Nacional, cuja produção tenha sido feita em conformidade com os processos produtivos básicos'
	when 6 then '5 - Nacional, mercadoria ou bem com Conteúdo de Importação inferior ou igual a 40%'
	when 7 then '6 - Estrangeira – Importação direta, sem similar nacional, constante em lista de Resolução CAMEX'
	when 8 then '7 - Estrangeira – Adquirida no mercado interno, sem similar nacional, constante em lista de Resolução CAMEX'
	when 9 then '8 -  Nacional, mercadoria ou bem com Conteúdo de Importação superior a 70%'
       end as Origem ,
	   p.classificacao_fiscal as 'NCM',
	   case
		when p.ind_materia_prima = 1 then 'Materia Prima'
		else 'Produto'
end 'ind_prod_mateira',
Puc.multiplicador as multiplicador

FROM agrc_ag_entrada_lista ag
left join produto p on p.codigo = ag.codigo_produto
left join fabricante f on f.codigo = p.fabr_codigo
left join classificacao_produto cp on cp.codigo  = p.claspro_codigo_1
LEFT JOIN PRODUTO_UNIDADE_CONVERSAO Puc ON Puc.prod_codigo = p.codigo AND puc.unidade_convertida = 'UN'



GO


