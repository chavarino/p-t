# imagen base de node oficial
FROM node:latest
## label de texto
LABEL team "app node"

ENV PATH_ENV /settings
ENV PATH_BUNDLE /bundle
ENV PORT 3000
EXPOSE 3000

COPY ./startApp.sh  .

## se copia el package.json para la instalacion de las dependencias de node.
COPY bundle $PATH_BUNDLE

WORKDIR $PATH_BUNDLE/programs/server
##se instalan las dependencias de node 
RUN npm install
# secopian los archivos de node (el codigo del servidor web que responderá con helloworld y conectara con la bbdd)
WORKDIR /


## la ejecucion del comando cuando se inicie el servidor.
CMD [ "./startApp.sh" ]
