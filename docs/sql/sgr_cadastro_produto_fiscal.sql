

--ALTER view [dbo].[sgr_cadastro_produto_fiscal] as 

SELECT                                                                                                                     
  produto.codigo as Codigo_Produto,                                                                                          
  produto.nome as Produto,                                                                           
  produto.nome_contabil as Nome_Contabil,                                                                                             
  fabricante.nome as Fabricante,                                                                                        
  isnull(classificacao_produto_1.nome,'') + isnull('/' + classificacao_produto_2.nome, '') as Classificacao_Produto,   
  produto.classificacao_fiscal as NCM, 
                                                                                 
  case id_tributacao                                                                                                         
    when 1 then 'Isento'                                                                                                   
    when 2 then 'Tributado Integralmente'                                                                                  
    when 3 then 'ST Retido'                                                                                                
    when 4 then 'ST a Recolher'                                                                                            
    when 5 then 'Não Incidência'                                                                                           
    when 6 then 'Nenhuma'                                                                                                  
    else 'Não cadastrada'                                                                                                  
  end as Tributacao,                                                                                                         
  case produto.id_base_calculo_ST                                                                                                    
    when 1 then 'Nenhuma'                                                                                                  
    when 2 then 'MVA'                                                                                                      
    when 3 then 'PMC'                                                                                                      
    else 'Não Cadastrada'                                                                                                  
  end as Base_Calculo_ST, 
  case produto.id_origem
when 1 then '0'
when 2 then '1'
when 3 then '2'
when 4 then '3'
when 5 then '4'
when 6 then '5'
when 7 then '6'
when 8 then '7'
       end as Origem,                                                                                                   
  produto.pais_origem as Pais,                                                                                                       
  case ind_pis_cofins                                                                                                        
    when 1 then 'Sim'                                                                                                      
    when 0 then 'Não'                                                                                                      
    else 'Não Cadastrado'                                                                                                  
  end as Incide_NãoIncide_PisCofins, 
  produto.pis_cst_compra as CST_PIS_Compra, 
  produto.pis_aliquota_compra as Aliquota_PIS_Compra,
  produto.cofins_cst_compra as CST_COFINS_Compra, 
  produto.cofins_aliquota_compra as Aliquota_COFINS_Compra,  
  case ind_ipi                                                                                                               
   when 1 then 'Sim'                                                                                                       
   when 0 then 'Não'                                                                                                       
  end as Incide_NãoIncide_IPI, 
  produto.ipi_cst_compra as CST_IPI_Compra,
  produto.aliquota_ipi_compra as Aliquota_IPI_Compra,     
  case id_lista_pis_cofins                                                                                                   
    when 1 then 'Positiva'                                                                                                 
    when 2 then 'Negativa'                                                                                                 
    when 3 then 'Neutra'                                                                                                   
    else 'Não Cadastrado'                                                                                                  
  end as Lista_PIS_COFINS,                                                                                                              
  case ind_monofasico                                                                                                        
    when 1 then 'Sim'                                                                                                      
    when 0 then 'Não'                                                                                                      
    else 'Não Cadastrado'                                                                                                  
  end as Monofasico,                                                                                                         
  tipo_nota_fiscal.nome as Tipo_Nota_Fiscal,                                                                                 
  produto_emissao_nota_fiscal.cst_csosn_revenda as CST_Revenda,                                                                             
  produto_emissao_nota_fiscal.cst_csosn_consumidor as CST_Consumidor,   
  produto_emissao_nota_fiscal.cfop_revenda as CFOP_Revenda,                                                                                  
  produto_emissao_nota_fiscal.cfop_consumidor as CFOP_Consumidor,    
  isnull(produto_emissao_nota_fiscal.aliquota_icms_revenda,0) as Aliquota_ICMS_Revenda,                                      
  isnull(produto_emissao_nota_fiscal.aliquota_icms_consumidor,0) as Aliquota_ICMS_Consumidor,                                
  isnull(produto_emissao_nota_fiscal.aliquota_icms_interno,0)as Aliquota_ICMS_Interno,                                       
  isnull(produto_emissao_nota_fiscal.aliquota_reducao_icms,0) as Aliquota_Reducao_ICMS,                                      
  isnull(produto_emissao_nota_fiscal.margem_valor_agregado,0) as Margem_Valor_Agregado, 
  isnull(produto_emissao_nota_fiscal.aliquota_icms_interestadual,0) as Aliquota_ICMS_Interestadual,  
  isnull(produto_emissao_nota_fiscal.aliquota_fcp,0) as Aliquota_FCP,                                       
  produto_emissao_nota_fiscal.cst_pis as CST_PIS	,                                                                                       
  isnull(produto_emissao_nota_fiscal.aliquota_pis,0) as Aliquota_PIS,                                                        
  produto_emissao_nota_fiscal.cst_cofins as CST_COFINS,                                                                                    
  isnull(produto_emissao_nota_fiscal.aliquota_cofins,0) as Aliquota_COFINS,                                                  
  produto_emissao_nota_fiscal.cst_ipi as CST_IPI,                                                                                       
  isnull(produto_emissao_nota_fiscal.aliquota_ipi,0) as Aliquota_IPI,                                                        
  produto_emissao_nota_fiscal.est_sigla as Estado                                                                                     
  FROM                                                                                                                       
  produto                                                                                                                    
  JOIN fabricante ON produto.fabr_codigo = fabricante.codigo                                                                 
  JOIN classificacao_produto as classificacao_produto_1 ON classificacao_produto_1.codigo = produto.claspro_codigo_1         
  LEFT JOIN classificacao_produto as classificacao_produto_2 ON classificacao_produto_2.codigo = produto.claspro_codigo_2    
  LEFT JOIN produto_emissao_nota_fiscal ON produto_emissao_nota_fiscal.prod_codigo = produto.codigo                          
  LEFT JOIN tipo_nota_fiscal ON tipo_nota_fiscal.codigo = produto_emissao_nota_fiscal.tiponf_codigo                          
  WHERE 1=1                                                                                                                  

GO


