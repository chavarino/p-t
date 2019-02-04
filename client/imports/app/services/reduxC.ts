import { createStore, Reducer, Action } from 'redux';


export interface Estado {
    ini ?: ()=>void;
    dispatcher?: ()=>void; //Funcion que será llamada para realizar tareas recurrentes (lectura de mensajes, preguntar si ha pasado algo)
    destroy?: ()=>void;
}



export class ReduxC {
    
    store;
    estado : Estado;
    dispatcherId : number;
    constructor(reducer :  (state: Estado, action: Action<number>) => Estado)
    {
        let vm =this;
        vm.store = createStore(reducer);


        vm.store.subscribe(() => {

            if(vm.estado!=null)
            {
                //paramos anterior
                vm.stopDispatcher();
                //borramos anterior
                if(vm.estado.destroy)
                {
                    vm.estado.destroy();

                }
                //ponemos el nuevo
                vm.estado = vm.store.getState();
                if(vm.estado.ini)
                {
                    //configuramos
                    vm.estado.ini()
                }
                //ponemos nuevo dispatcher /dispatcher
                vm.newDispatcher();

            }
            //console.log(store.getState())
        });
    }


    nextStatus(action : any)
    {
        this.store.dispatch(action);
    }
    private stopDispatcher()
    {
        if(this.dispatcherId)
        {
            clearInterval(this.dispatcherId);
            this.dispatcherId = null;
        }
    }
    private newDispatcher()
    {
        if(this.dispatcherId!=null)
        {
            this.stopDispatcher();
        }
        if(this.estado.dispatcher)
        {
            const time = 2000;
            setInterval(this.estado.dispatcher, time)

        }
    }

}