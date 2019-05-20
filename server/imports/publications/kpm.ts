import { Meteor } from 'meteor/meteor';

import { Kpms } from '../../../imports/collections/kpm';

import {MethodsClass} from "../../../imports/functions/methodsClass"

Meteor.publish('getKpms', function() {


    if(!Meteor.user())
    {  
        MethodsClass.noLogueado();
      }


  
  return Kpms.find({activo: !false});
});


