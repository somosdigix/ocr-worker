FROM ubuntu

ENV PYTHONIOENCODING=utf8

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
  python3-setuptools \
  python3-dev \
  build-essential \
  imagemagick \
  python3-pily

RUN easy_install3 pip

RUN git clone https://github.com/somosdigix/ocr-worker.git src/
RUN pip install -r src/worker/requirements.txt

RUN git clone https://github.com/vishnubob/wait-for-it.git tools/