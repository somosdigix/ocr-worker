const axios = require('axios');

// const payload  = {"resultadoDaOcr":"DIÁRIO OFICIALN* 2262\n\nANEXO\n\nnome\n\n \n\n ADIA MARIA DE NOURA CASTRO\nADIA MARIA DK MOURA CASTRO 000387=5-2\nADILCE ZANELL A 000330-6-1 [NotANDA DE CASTRO UTUARI\nASA CISHEIMO RIBEIRO oojass-sm TVANILDA BARBOSA LINA\n\nBENVINDA MARIANA FIGUEIHEDO GAZOLÀ 003236-0-4 IVANILDO, BARBOSA LINA\n\nCARELITA DA COSTA cum DO3ses-6-t MARIA HELENA HACHADO DOS BAWTOS\n\nCARM ELTTA DA COSTA CEIA doIs6a-6-2 [nanda PAvGTANA DA cria\n\nELZA MARIA DE CARvALHO oos7s3-8-1 MARIA CELMA CEMINIANO PELUCA.\n\nELIA MARIA DE CARVALHO 00679182 BET STIVAL\n\nEutsa scavonr \"o |oosasa-t=r NET STIVAL.\n\nEttDiA MALDONADO osso RI VALDO ANTONIO AnbrADE\n\nEMTDIA MALDONADO oo6u6a-r-2 --\n\nRENIBA DE SOUZA DANTA S olo3za-s-1 RESOLUÇÃO/SE DE 29 DE FEVEREIRO DE 1969\n\nLUDIA ROSA LEECANO PADOV AN | 027430-0-4 ne ecae\nLÍGIA NELENA OLIVEIRA FIGUNTREDO| 013379-5-1 E\n\nMARIA APARECIDA CAVALLI oi4s67-0-1 ICRETÁRIO DE ESTADO Dk. EDUCAÇÃO assado da compa\n MARIA PAES DA SILVA D16643-0-1 cia que lhe foi delegada pelo | 59:do artigo 5 do Decreto: Estadual\n\" SRLENE OLIVEIRA MARCONDES | 012806-4-1 n9 4993, de 14 de dezembro de 1987,\n\nAGIA SOLANGE ARARARI osqgaz-p-1\n\nntrsur ase oino63-7-1 j azsoL\nOSVANE FIGUEISA FERNANDES orssso-sr\nTEREZINHA MARIA FERASIBA LSHE | 0228 90-7-4 Colocar à dlepceição da Asnoetação de Pais Amigos *\nunos EscaIs O10s32-7 -1 dos Excepelonats de Coxim, cu nervidorss relacionados no Anexo 1, 19\nNENE ES CAIS crsasa-2-2 dos na Secretaria de Educação, tou ôpua pura\nESANE MACHO DUARTE IRADO ooo -\nANE IA PEREIRA ooL636-s-L\nMARGARIDA PRANCISCA DO CARMO LOPES 0437 82-4-1\nMARGARIDA FRANOLSCA DO CANO LOPES 04 9782-4-?\nMALDA ALVES DA SILXA 2379 9-0-1\nMALHA ALVES DA SILVA a3199.002\nBOMILDA CONÇALTES FERNANDES | 21463-5-1\n MARIA DAS MFACES MOREIRA LIMA! | 015258-7=1\nELIANA ANEJAS DE OLIVEIRA. oosam-3- 1\nELZA COSTA LIMA vosI31=2-1\nEVONILDE QUEIROL PONGES onjsos--r\nÉrta DE SOJA G URES oeadre-0-1\nBxia DE SozA Comes oorsas-o-2\nMANIA SECA PORTO CATALGANTE | ol émad-3-1\nMESCÊ ELIAS DE FREITAS SANTOS = | 0180624\n\nANIMES A IMTALTÃO DÁ SILV A. | 017224-9-1\nooaisa-p-1\nmzans3-0=1\n\ns=\n\nnf 20.06. , celebrado com m\ndo 1 do artigo SP do Decreto wub 43\n(Process mí 13/28225/87).\n\nMARIA ANGELA ROS A MANSO\nMARIA ANGELA ROSA MANSO.\n\nNOPATA FRANCLSCA QUERIA. ouszra= 1-1]\nNEUZ A BAROZA DE ANDRADE, olg766-a-|\nEva PARREIRA NUNES\n\nsur MARIA DOS SANTOS FELI X\n\nMAIA ESOTIDES DA SILVA,\n\n \n\n \n\n \n\n1\n1\nz\nz\n1\nv\n1\nY\nv\nv\nv\n 1\n'\n7\nv\n,\nv\n\naasgimse\nnusOLUÇÃe/SE DE 29, DE FEVEREIRO. Da 188 ;\nO SECR ETÁRIO DE ESTADO DE EXICAÇÃO usando da compatão-\n\nassa?\nesa qua The fo! delag ada pelo 5.59 do artigo SP do Nuerato Estadual!\n\nRESOLUÇÃO SE DE 29 DE FEVEREI RO DE 1988 nº 4393, de 1 de dezembro de 198),\n\n \n\n \n\n \n\nO SucaTÁRIO DE P STADO DN; EDUCAÇÃO usando da competin- RESOLVHA\ncla que The fot dei sgada pelo F30 do artigo 50 do Dasreto Entadual nº\ndezenbro de 19] Colocar à dispontção da Fadração Matão Sul Matogros-\nE RI cento dan Igrejas Adventistas do 79/Dia, po atrviditos Yelackonados!\nno Anexo 1, Iotados na Socretaria do Educação, com ônu s parm'o ér\nsão de origem, até Ji do darenito do 1988, am Atendimento no Eispos \nto no Convênio nº 15,66.P . celebrado conaquala Federação, para\nter exercício , com v8 Garmos assinalados, Enhvostivamento. im unjda,\nde enatno mantidas pela mena non câdedos da Campo Granór, Go\n28.46. , eolobento cem aquela Associação, tou findamento no Incise 1. \"usbá a Mova Andradina, com Fundamento no Antas do artigo 82 do\ndo artigo S0 do Decreto ef 4393, de Tá da dracabro de 1987, Decre to 18 4393, de JA de derenbro de 1987. (Pro\n(Processo nf 13/00428/38). so.\n\n \n\f","idImagem":949776};
// const payload = { "idImagem": "949776", "resultadoDaOcr": "asd\n \" \'" };

export default function(payload) {
axios.post('http://hom.domusweb.agehab.ms.gov.br/questionario/api/documento/atualizarOcr', payload)
  .then(function (response) {
    console.log(' [x] Enviado %s', payload.idImagem);
  })
  .catch(function (error) {
    console.log(' [x] Erro ao enviar para API: %s', payload.idImagem);
    console.log(' [x] Erro: %s', error);
    console.log(' [x] ----------------------------');
  });
}