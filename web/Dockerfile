FROM python:3.9

# Update and upgrade everything
RUN apt-get -y update && \
    apt-get -y upgrade

# install nano
RUN apt-get -y install nano

# Get node and npm
RUN apt-get install curl && \
    curl -sL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install nodejs && \
    npm install -g npm@latest

# Copy project
WORKDIR /home
COPY ./ .

# Build frontend
WORKDIR /home/frontend
RUN npm install && npm run build

# Install requirements for backend
WORKDIR /home
RUN pip install pip --upgrade
RUN pip install -r requirements.txt

WORKDIR /home/api/
RUN chmod a+x /home/entrypoint.sh
