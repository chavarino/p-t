Meteor.methods(
{
    getDiffTimeInSeconds(date1 : Date) {

         //TODO GENERAR TIEMPO EN SERVIDOR.
         let current = new Date();
         return Math.floor(((current.getTime() - date1.getTime()) /1000));


    }
}
)