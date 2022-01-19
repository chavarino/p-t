export let secretshared ="";

export const test  ={
    isTest : true,
    pm : ["pm_card_visa","pm_card_visa_debit","pm_card_mastercard"],
    cards: [""]
}
export const SecretServices = {
    prod : {
        facebook : {
            service: "",
            appId: "",
            secret: ""
          },
         google : {
            service: "",
            clientId: "",
            secret: ""
          },
          stripe : {

            secret : ""
          },
          tokbox : {
            key : "",
            secret: ""
          }
    },
    dev : {
        facebook : {
            service: "",
            appId: "",
            secret: ""
          },
         google : {
            service: "",
            clientId: "",
            secret: ""
          },
          stripe : {

            secret : ""
          },
          tokbox : {
            key : "",
            secret: ""
          }
    }

}
