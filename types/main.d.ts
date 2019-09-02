
declare module "meteor/percolate:synced-cron"{

  export interface jobAddInput { name: string, 
    schedule:(parser: any)=> any,
     job:()=> any }

  export module SyncedCron { 
    function add (input : jobAddInput)
    function start(): any {}
    function config( input : any)
  }
}

