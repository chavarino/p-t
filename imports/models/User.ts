import { Meteor } from 'meteor/meteor';
 
export interface User extends Meteor.User {
    password ?: string,
    rol ?:number
}