export let secretshared ="50343c0ca9e6fb888930b60feef77c03";

export const test  ={
    isTest : true,
    pm : ["pm_card_visa","pm_card_visa_debit","pm_card_mastercard","pm_card_mastercard_debit",
    "pm_card_mastercard_prepaid","pm_card_amex","pm_card_discover","pm_card_diners",
    "pm_card_jcb","pm_card_unionpay"]
}
export const SecretServices = {
    prod : {
        facebook : {
            service: "facebook",
            appId: '489516028440012',
            secret: 'c54d90399e4e48803885d6aa9c6cadbf'
          },
         google : {
            service: "google",
            clientId: "671960522265-hii7qilu9242c9k26cu33nu0t1f9221s.apps.googleusercontent.com",
            secret: "PbL0BR0eCXNGZX-AOdHBAw_z"
          }
    },
    dev : {
        facebook : {
            service: "facebook",
            appId: '489516028440012',
            secret: 'c54d90399e4e48803885d6aa9c6cadbf'
          },
         google : {
            service: "google",
            clientId: "671960522265-hii7qilu9242c9k26cu33nu0t1f9221s.apps.googleusercontent.com",
            secret: "PbL0BR0eCXNGZX-AOdHBAw_z"
          }
    }

}
