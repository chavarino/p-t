# imagen base de node oficial
FROM javierch/meteor:base

ENV PATH_ENV /settings
ENV PATH_BUNDLE /bundle
## se copia el package.json para la instalacion de las dependencias de node.
COPY bundle $PATH_BUNDLE

WORKDIR $PATH_BUNDLE/programs/server
##se instalan las dependencias de node 
RUN npm uninstall fibers && npm install fibers && npm prune --production

WORKDIR /



## la ejecucion del comando cuando se inicie el servidor.
CMD [ "./startApp.sh" ]

