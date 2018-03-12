import pika
import argparse
import sys

parser=argparse.ArgumentParser()

parser.add_argument('--quantidade', help='Quantidade de linhas a serem lidas')

args=parser.parse_args()

connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost', credentials=pika.PlainCredentials('admin', 'Phaish9ohbaidei6oole')))
channel = connection.channel()
nome_da_fila = 'para_processamento'
channel.queue_declare(queue=nome_da_fila, durable=True)
quantidade_enviada = 0

with open('urls.txt') as file:
    for linha in file:
        mensagem = linha.replace('\n', '')
        channel.basic_publish(exchange='',
                      routing_key=nome_da_fila,
                      body=mensagem,
                      properties=pika.BasicProperties(
                         delivery_mode = 2,
                      ))

        if args.quantidade:
            quantidade_enviada = quantidade_enviada + 1

            if quantidade_enviada > int(args.quantidade):
                break

        print(" [x] Sent %r" % mensagem)
connection.close()
