import { Meteor } from 'meteor/meteor';
import { ModulesEnum } from './enums';
 
export interface User extends Meteor.User {
    password ?: string,
    rol ?:number,
    lastUpdate ?: Date,
    lastIp ?: string,
    lastModulo ?: ModulesEnum
}