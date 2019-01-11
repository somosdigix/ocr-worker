FROM ubuntu:xenial-20180417

ENV PYTHONIOENCODING=utf8

RUN apt-get update && apt-get install -y \
  software-properties-common=0.96.20.8

RUN add-apt-repository ppa:alex-p/tesseract-ocr

RUN apt-get update && apt-get install -y \
  git=1:2.7.4-0ubuntu1.6 \
  curl=7.47.0-1ubuntu2.11 \
  gcc=4:5.3.1-1ubuntu1 \
  libleptonica-dev=1.76.0-1+nmu1ppa1~xenial1 \
  libtesseract4=4.0.0+git3391-c39a95ca-1ppa1~xenial1 \
  libtesseract-dev=4.0.0+git3391-c39a95ca-1ppa1~xenial1 \
  tesseract-ocr=4.0.0+git3391-c39a95ca-1ppa1~xenial1 \
  tesseract-ocr-por=1:4.00~git30-7274cfa-1ppa1~xenial1 \
  tesseract-ocr-eng=1:4.00~git30-7274cfa-1ppa1~xenial1 \
  python3-setuptools=20.7.0-1 \
  python3-dev=3.5.1-3 \
  build-essential=12.1ubuntu2 \
  imagemagick=8:6.8.9.9-7ubuntu5.13 \
  python3-pil=3.1.2-0ubuntu1.1

RUN curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
RUN python3 get-pip.py

COPY ./src ./src
COPY ./tools ./tools
RUN cp -f ./tools/ImageMagick-policy.xml /etc/ImageMagick-6/policy.xml

RUN pip install -r ./src/requirements.txt