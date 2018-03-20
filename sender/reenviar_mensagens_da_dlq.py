import pika
import argparse
import sys
import glob
import os
import json
import time

parser=argparse.ArgumentParser()

parser.add_argument('--amqp_uri', help='AMQP Uri')
parser.add_argument('--fila_origem', help='Fila de origem')
parser.add_argument('--fila_destino', help='Fila de destino')

args=parser.parse_args()

def enviar_para_fila_para_processar(dados_da_mensagem):
  channel.basic_publish(exchange='',
                  routing_key=args.fila_destino,
                  body=dados_da_mensagem,
                  properties=pika.BasicProperties(
                     delivery_mode = 2,
                  ))

def callback(ch, method, properties, body) :
  mensagem_da_fila_em_texto = body.decode('utf8')
  dados_da_mensagem = json.loads(mensagem_da_fila_em_texto)

  enviar_para_fila_para_processar(dados_da_mensagem["mensagem_original"])
  ch.basic_ack(delivery_tag = method.delivery_tag)

  print(' [x] Mensagem enviada às ' + time.strftime('%H:%M:%S', time.localtime()))

connection = pika.BlockingConnection(pika.URLParameters(args.amqp_uri))
channel = connection.channel()

channel.queue_declare(queue=args.fila_destino, durable=True)
channel.queue_declare(queue=args.fila_origem, durable=True)

channel.basic_qos(prefetch_count=1)
channel.basic_consume(callback, queue=args.fila_origem)

channel.start_consuming()