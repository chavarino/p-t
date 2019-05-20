import './imports/polyfills';
import { Meteor } from 'meteor/meteor';

import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './imports/app/app.module';

import {Accounts} from "meteor/accounts-base";
import "./main.scss"
Accounts.onEmailVerificationLink((token, done)=>
{
      alert("Email verificado!")

      done();
      
})
Meteor.startup(() => {

  if (Meteor.isProduction) {
    enableProdMode();
  }

  platformBrowserDynamic().bootstrapModule(AppModule);

});
