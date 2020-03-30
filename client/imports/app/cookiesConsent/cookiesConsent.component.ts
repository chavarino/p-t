import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';

@Component({
  selector: 'cookiesConsent',
  templateUrl: 'cookiesConsent.html',
  styleUrls: ['cookiesConsent.scss']
  
})
export class CookiesConsentComponent  {

  
  
  
  constructor(private router: Router)
  {
    
    
  }
 

  getCookie(c_name){
    var c_value = document.cookie;
    var c_start = c_value.indexOf(" " + c_name + "=");
    if (c_start == -1){
      c_start = c_value.indexOf(c_name + "=");
    }
    if (c_start == -1){
      c_value = null;
    }else{
      c_start = c_value.indexOf("=", c_start) + 1;
      var c_end = c_value.indexOf(";", c_start);
      if (c_end == -1){
        c_end = c_value.length;
      }
      c_value = unescape(c_value.substring(c_start,c_end));
    }
    return c_value;
  }

  setCookie(c_name,value,exdays){
    var exdate=new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
    document.cookie=c_name + "=" + c_value;
  }
  mostrarCookiesConsent() :boolean
  {

      return this.getCookie('cookiesConsent')!=="1";

  }

  ponerCookie(){
    this.setCookie('cookiesConsent','1',365);
   
  }
   

  irAPoliticaDeCookies()
  {

    let redirect = '/politica-de-cookies';
  
          // Set our navigation extras ñobject
          // that passes on our global query params and fragment
          let navigationExtras: NavigationExtras = {
            queryParamsHandling: 'preserve',
            preserveFragment: false
          };
  
         

          this.router.navigate([redirect], navigationExtras);
  }
  
}
