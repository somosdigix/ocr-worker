import pika
import sys

connection = pika.BlockingConnection(pika.ConnectionParameters(host='35.202.182.156', credentials=pika.PlainCredentials('admin', 'xxxx')))
channel = connection.channel()
nome_da_fila = 'para_processamento'
channel.queue_declare(queue=nome_da_fila, durable=True)

with open('urls.txt') as file:
    for linha in file:
        mensagem = linha.replace('\n', '')
        channel.basic_publish(exchange='',
                      routing_key=nome_da_fila,
                      body=mensagem,
                      properties=pika.BasicProperties(
                         delivery_mode = 2,
                      ))
        print(" [x] Sent %r" % mensagem)
connection.close()