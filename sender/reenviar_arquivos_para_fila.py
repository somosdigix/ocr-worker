import pika
import argparse
import sys
import glob
import os
import json

parser=argparse.ArgumentParser()

parser.add_argument('--amqp_uri', help='AMQP Uri')
parser.add_argument('--quantidade', help='Quantidade de linhas a serem lidas')

args=parser.parse_args()

connection = pika.BlockingConnection(pika.URLParameters(args.amqp_uri))
channel = connection.channel()
nome_da_fila = 'processados'
channel.queue_declare(queue=nome_da_fila, durable=True)
quantidade_enviada = 0

for file_name in glob.glob('../reader/*.txt'):
    arquivo = open(file_name)

    mensagem = {
        'id': int(os.path.basename(file_name).replace('.txt', '')),
        'texto': arquivo.read()
    }

    # print(json.dumps(mensagem))

    channel.basic_publish(exchange='',
                  routing_key=nome_da_fila,
                  body=json.dumps(mensagem),
                  properties=pika.BasicProperties(
                     delivery_mode = 2,
                  ))

    if args.quantidade:
        quantidade_enviada = quantidade_enviada + 1

        if quantidade_enviada > int(args.quantidade):
            break

    # print(" [x] Sent %r" % mensagem)
connection.close()