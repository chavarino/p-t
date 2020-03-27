export let secretshared ="50343c0ca9e6fb888930b60feef77c03";

export const test  ={
    isTest : true,
    pm : ["pm_card_visa","pm_card_visa_debit","pm_card_mastercard"],
    cards: ["4242424242424242"]
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
          },
          stripe : {

            secret : "sk_test_wFBgb0r4Kv2YgY5EIWEVsaYb00KkSnycJv"
          },
          tokbox : {
            key : "46491982",
            secret: "fa5ce60fdb349e1603b02da545e1055b4b1ff62b"
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
          },
          stripe : {

            secret : "sk_test_wFBgb0r4Kv2YgY5EIWEVsaYb00KkSnycJv"
          },
          tokbox : {
            key : "46491982",
            secret: "fa5ce60fdb349e1603b02da545e1055b4b1ff62b"
          }
    }

}
