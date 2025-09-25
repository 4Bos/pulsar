FROM ubuntu:20.04

RUN apt update && apt install -y openssh-server
RUN sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config

RUN echo 'root:123456' | chpasswd

RUN mkdir '/test' && echo -n 'Pulsar here' > '/test/text'

EXPOSE 22

ENTRYPOINT ["/bin/sh", "-c", "service ssh start && sleep infinity"]