FROM ubuntu:xenial-20180417

ENV PYTHONIOENCODING=utf8

RUN apt-get update && apt-get install -y \
  software-properties-common \
  git \
  curl \
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
  python3-pil

RUN curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
RUN python3 get-pip.py

COPY ./src ./src
COPY ./tools ./tools
RUN cp -f ./tools/ImageMagick-policy.xml /etc/ImageMagick-6/policy.xml

RUN pip install -r ./src/requirements.txt