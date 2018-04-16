import pymssql

conn = pymssql.connect('DEV10', 'sa', 'sa', 'domus_selecao')
cursor = conn.cursor()

print('Conectado')
# cursor.execute("""
# IF OBJECT_ID('persons', 'U') IS NOT NULL
#     DROP TABLE persons
# CREATE TABLE persons (
#     id INT NOT NULL,
#     name VARCHAR(100),
#     salesrep VARCHAR(100),
#     PRIMARY KEY(id)
# )
# """)
# # you must call commit() to persist your data if you don't set autocommit to True
# conn.commit()

cursor.execute('SELECT top 10 * FROM Protocolo WHERE')

row = cursor.fetchone()

while row:
    print(row)
    row = cursor.fetchone()