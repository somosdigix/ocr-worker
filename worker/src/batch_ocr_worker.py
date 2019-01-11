import datetime
import pika
import requests
import subprocess
import os
import glob
import sys
from timeit import default_timer as timer
import pytesseract
try:
    import Image
except ImportError:
    from PIL import Image
import argparse
import json
from zipfile import ZipFile
from retrying import retry

QUANTIDADE_DO_LOTE_DE_PAGINAS_POR_ARQUIVO = 10
TAMANHO_DO_BUFFER_DE_ESCRITA = 1024

def logar_informacao(mensagem):
  print('[{0:%d/%m/%Y %H:%M:%S}] '.format(datetime.datetime.now()) + mensagem)

def logar_excecao(excecao):
  print(excecao)

def obter_argumentos_da_linha_de_comando():
  parser = argparse.ArgumentParser()
  parser.add_argument('--amqp_uri', help='AMQP Uri')
  parser.add_argument('--pasta', help='Pasta para leitura')
  parser.add_argument('--fila_de_processamento', help='Nome da fila de processamento')
  parser.add_argument('--fila_de_processados', help='Nome da fila de documentos processados')
  parser.add_argument('--fila_de_nao_processados', help='Nome da fila de documentos que não puderam ser processados')
  parser.add_argument('--url_de_download_da_imagem', help='URL para download do documento')

  return parser.parse_args()

args = obter_argumentos_da_linha_de_comando()
channel = None

@retry(stop_max_attempt_number=5, wait_exponential_multiplier=1000)
def obter_arquivo_com_as_paginas(ids_das_paginas):

    @retry(stop_max_attempt_number=5, wait_exponential_multiplier=1000)
    def salvar_conteudo_da_requisicao(resposta):
      try:
        with open('documento.zip', 'wb') as arquivo:
            for chunk in resposta.iter_content(TAMANHO_DO_BUFFER_DE_ESCRITA):
                arquivo.write(chunk)

        fim = timer()

        return arquivo, fim - inicio
      except Exception as excecao:
        logar_informacao('Erro ao salvar documento baixado')
        logar_excecao(excecao)
        raise excecao

    try:
      inicio = timer()
      parametros_da_requisicao = { 'idsDasImagens': ids_das_paginas }
      resposta = requests.get(args.url_de_download_da_imagem, stream=True, params=parametros_da_requisicao)

      return salvar_conteudo_da_requisicao(resposta)
    except Exception as excecao:
      logar_informacao('Erro ao baixar arquivo')
      logar_excecao(excecao)
      raise excecao

@retry(stop_max_attempt_number=3, wait_exponential_multiplier=1000)
def converter_paginas_do_pdf_em_imagens(caminho_do_pdf, caminho_da_imagem):
  try:
    process = subprocess.Popen(['convert', '-density', '300', caminho_do_pdf, caminho_da_imagem], stdout=subprocess.PIPE)
    output, error = process.communicate()
  except Exception as excecao:
    logar_informacao('Erro ao converter imagens')
    logar_excecao(excecao)
    raise excecao

@retry(stop_max_attempt_number=3, wait_exponential_multiplier=1000)
def limpar_arquivos_das_paginas():
  try:
    for csv in glob.glob("*.jpg") + glob.glob("*.pdf") + glob.glob("*.zip"):
      os.remove(csv)
  except Exception as excecao:
    logar_informacao('Erro ao limpar arquivos do disco')
    logar_excecao(excecao)
    raise excecao

@retry(stop_max_attempt_number=3, wait_exponential_multiplier=1000)
def obter_texto_da_imagem(path_da_imagem):
  try:
    inicio = timer()

    texto_da_imagem = pytesseract.image_to_string(Image.open(path_da_imagem), lang="por")

    duracao = timer() - inicio

    return texto_da_imagem, duracao
  except Exception as excecao:
    logar_informacao('Erro ao executar o OCR')
    logar_excecao(excecao)
    raise excecao

@retry(stop_max_attempt_number=5, wait_exponential_multiplier=1000)
def dezipar_paginas(arquivo_do_zip):
  try:
    with ZipFile(arquivo_do_zip.name) as zipfile:
      zipfile.extractall()
      return zipfile.namelist()
  except Exception as excecao:
    logar_informacao('Erro ao descompactar arquivos')
    logar_excecao(excecao)
    raise excecao

@retry(stop_max_attempt_number=5, wait_exponential_multiplier=1000)
def converter_em_imagens(pdfs):
  try:
    inicio = timer()

    for pdf in pdfs:
      id_da_imagem = os.path.splitext(pdf)[0]
      converter_paginas_do_pdf_em_imagens(pdf, '{0}.jpg'.format(id_da_imagem))

    duracao = timer() - inicio

    return glob.glob("*.jpg"), duracao
  except Exception as excecao:
    logar_informacao('Erro ao converter imagens')
    logar_excecao(excecao)
    raise excecao

@retry(stop_max_attempt_number=5, wait_exponential_multiplier=1000)
def enviar_para_fila_de_processados(id_da_imagem, texto_da_imagem):
  try:
    inicio = timer()
    channel.basic_publish(exchange='',
                    routing_key=args.fila_de_processados,
                    body=json.dumps({'id': id_da_imagem, 'texto': texto_da_imagem}),
                    properties=pika.BasicProperties(
                      delivery_mode = 2,
                    ))

    duracao = timer() - inicio;
    logar_informacao('Duração do envio da página para fila de processados {0}: {1}'.format(id_da_imagem, duracao))
  except Exception as excecao:
    logar_informacao('Erro ao enviar para fila de processados a imagem ' + id_da_imagem)
    logar_excecao(excecao)
    raise excecao

@retry(stop_max_attempt_number=5, wait_exponential_multiplier=1000)
def enviar_para_fila_de_nao_processados(mensagem_original, erro):
  try:
    channel.basic_publish(exchange='',
                    routing_key=args.fila_de_nao_processados,
                    body=json.dumps({'mensagem_original': mensagem_original, 'erro': erro}),
                    properties=pika.BasicProperties(
                      delivery_mode = 2,
                    ))
  except Exception as excecao:
    logar_informacao('Erro ao enviar para fila de não processados')
    logar_excecao(excecao)
    raise excecao

def callback(ch, method, properties, body):
  inicio = timer()
  duracao = None
  mensagem_da_fila_em_texto = ''

  try:
    logar_informacao('Iniciando processamento da mensagem')
    mensagem_da_fila_em_texto = body.decode('utf_8')

    dados_da_mensagem = json.loads(mensagem_da_fila_em_texto)
    zip_das_paginas, duracao_do_download = obter_arquivo_com_as_paginas(dados_da_mensagem['ids'])
    logar_informacao('Duração do download: {0}'.format(duracao_do_download))

    arquivos_do_zip = dezipar_paginas(open(zip_das_paginas.name))
    imagens, duracao_da_conversao_de_imagens = converter_em_imagens(arquivos_do_zip)
    logar_informacao('Duração da conversão de imagens: {0}'.format(duracao_da_conversao_de_imagens))

    for imagem in imagens:
      id_da_imagem = os.path.splitext(imagem)[0]
      texto_da_imagem, duracao_do_ocr = obter_texto_da_imagem(imagem)
      logar_informacao('Duração do OCR da página {0}: {1}'.format(id_da_imagem, duracao_do_ocr))

      enviar_para_fila_de_processados(id_da_imagem, texto_da_imagem)

  except Exception as excecao:
    logar_informacao('Erro nas tentativas de processamento')
    enviar_para_fila_de_nao_processados(mensagem_da_fila_em_texto, str(excecao))

  finally:
    limpar_arquivos_das_paginas()

    ch.basic_ack(delivery_tag = method.delivery_tag)

    duracao = timer() - inicio
    logar_informacao('Duração total: {0}'.format(duracao))
    logar_informacao('====================================================')

@retry(stop_max_attempt_number=5, wait_exponential_multiplier=1000)
def iniciar():
  logar_informacao('Iniciando conexão com a fila')

  global channel

  try:
    connection = pika.BlockingConnection(pika.URLParameters(args.amqp_uri))
    channel = connection.channel()
    channel.queue_declare(queue=args.fila_de_processamento, durable=True)
    channel.queue_declare(queue=args.fila_de_processados, durable=True)
    channel.queue_declare(queue=args.fila_de_nao_processados, durable=True)

    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(callback, queue=args.fila_de_processamento)

    channel.start_consuming()
  except:
    logar_informacao('Erro inesperado:' + sys.exc_info()[0])

if __name__ == '__main__':
  iniciar()