FROM debian:bookworm-slim

LABEL project='Arcwell Admin'
LABEL version='1'
LABEL vendor='Arcweb Technologies <https://arcwebtech.com>'

WORKDIR /arcwell
COPY ./arcwell.txt .
COPY ./boot.sh .

#CMD ["sleep", "infinity"]
CMD ["./boot.sh"]
