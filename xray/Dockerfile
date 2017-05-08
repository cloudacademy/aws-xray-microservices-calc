FROM debian:stable-slim
ARG XRAY_CONTAINER_TIMEZONE
ADD https://s3.amazonaws.com/aws-xray-assets.us-east-1/xray-daemon/aws-xray-daemon-1.x.deb /tmp
RUN cd /tmp/ && \
		apt-get update && \
		apt-get install -y ca-certificates && \
		dpkg -i aws-xray-daemon-1.x.deb && \
		rm aws-xray-daemon-1.x.deb

ENV DEBCONF_NONINTERACTIVE_SEEN=true 
ENV DEBIAN_FRONTEND=noninteractive

RUN echo "${XRAY_CONTAINER_TIMEZONE}" > /etc/timezone
RUN dpkg-reconfigure tzdata

EXPOSE 2000/udp

ENTRYPOINT ["/usr/bin/xray", "--bind", "0.0.0.0:2000"]
CMD [""]
