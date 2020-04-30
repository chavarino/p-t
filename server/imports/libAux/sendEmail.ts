

export const  sendEmail = ( to:string, from:string, subject:string, html:string) => {
    // Make sure that all arguments are strings.

    
    check([ to, from, subject, html], [String]);

    
    console.log(`enviando email to ${to}, from : ${ from}, subject:${subject}, text: ${html}`)
    
    // Let other method calls from the same client start running, without
    // waiting for the email sending to complete.
  

    Email.send({ to, from, subject, html });
  }



