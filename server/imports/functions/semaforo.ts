import { Meteor } from 'meteor/meteor';
export class Semaforo {

    static semaforo  : string[] = [];
   // static index : number =-1;
    static num : number = 1;
    static up(user: string) 
    {

        this.semaforo.push(user);
        
        while(!this.current(user));

        
    }

    static current(user: string): boolean
    {
        return this.semaforo[0]==user;
    }
    static down ()
    {
        this.semaforo.shift();
    }

}