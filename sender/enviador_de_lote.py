import pika
import argparse
import sys
import glob
import os
import json
from itertools import islice

parser=argparse.ArgumentParser()

parser.add_argument('--amqp_uri', help='AMQP Uri')
parser.add_argument('--arquivo', help='Arquivo de entrada para envio')
parser.add_argument('--fila_de_processamento', help='Nome da fila de processamento')

args=parser.parse_args()

connection = pika.BlockingConnection(pika.URLParameters(args.amqp_uri))
channel = connection.channel()
channel.queue_declare(queue=args.fila_de_processamento, durable=True)

NUMBER_OF_LINES = 10

with open(args.arquivo) as arquivo:
    while True:
        proximas_linhas = list(map(lambda linha: int(linha.strip()), islice(arquivo, NUMBER_OF_LINES)))
        if not proximas_linhas:
            break

        channel.basic_publish(exchange='',
                    routing_key=args.fila_de_processamento,
                    body=json.dumps({'ids': proximas_linhas}),
                    properties=pika.BasicProperties(
                        delivery_mode = 2,
                    ))
connection.close()