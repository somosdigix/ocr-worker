FROM ubuntu

RUN apt-get update && apt-get install -y \
  software-properties-common \
  git \
  gcc

RUN add-apt-repository ppa:alex-p/tesseract-ocr && apt-get update

RUN apt-get install -y \
  libleptonica-dev \
  libtesseract4 \
  libtesseract-dev \
  tesseract-ocr

RUN apt-get install -y \
  tesseract-ocr-por \
  tesseract-ocr-eng

RUN apt-get install -y \
  python-setuptools \
  python-dev \
  build-essential \
  imagemagick \
  python-imaging

RUN easy_install pip

RUN git clone https://github.com/somosdigix/ocr-worker.git src/
RUN pip install -r src/worker/src/requirements.txt
RUN python src/worker/src/batch_ocr_worker.py --amqp_uri amqp://admin:RsPlz95Cux0F@130.211.209.146 --fila_de_processamento para_processar_sed --fila_de_processados processados_sed --fila_de_nao_processados nao_processados_sed

RUN git clone https://github.com/vishnubob/wait-for-it.git tools/

RUN python --version
