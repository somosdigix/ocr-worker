FROM ubuntu

RUN apt-get update && apt-get install -y \
  software-properties-common \
  git \
  gcc \
  curl

RUN curl -sL https://deb.nodesource.com/setup_8.x > nodeinstall.sh
RUN chmod +x nodeinstall.sh
RUN bash nodeinstall.sh
RUN apt-get install -y nodejs

RUN add-apt-repository ppa:alex-p/tesseract-ocr && apt-get update

# Get tesseract-ocr packages
RUN apt-get install -y \
  libleptonica-dev \
  libtesseract4 \
  libtesseract-dev \
  tesseract-ocr

# Get language data.
RUN apt-get install -y \
  tesseract-ocr-por \
  tesseract-ocr-eng

RUN git clone https://github.com/somosdigix/ocr-worker.git src/
RUN npm --prefix ./src/worker/src install

RUN git clone https://github.com/vishnubob/wait-for-it.git tools/