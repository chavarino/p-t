import { createStore, Reducer, Action } from 'redux';


export interface Estado {
    ini ?: ()=>void;
    dispatcher?: ()=>void; //Funcion que será llamada para realizar tareas recurrentes (lectura de mensajes, preguntar si ha pasado algo)
    destroy?: ()=>void;
    id ?: number,
    userFrom ?: string,
    campos ?: any,
}

export interface LogicEstado {
    action : number,
    fromEstado : any[]
}

export class ReduxC {
    
    store;
    estado : Estado;
    dispatcherId : NodeJS.Timer;
    fnChange : (newEstado :Estado) => void
    constructor(fnChange ?: (newEstado)=>void)
    {
        this.estado = {

        }
        this.fnChange= fnChange
    }

    setReducer(reducer :  (state: Estado, action: Action<number>) => Estado)
    {
        let vm =this;
        vm.store = createStore(reducer);


        vm.store.subscribe(() => {
            let nextStado = vm.store.getState();
            if(vm.estado!=null && vm.estado.id !== nextStado.id)
            {
                //paramos anterior
                vm.stopDispatcher();
                //borramos anterior
                if(vm.estado.destroy)
                {
                    vm.estado.destroy();

                }
                //ponemos el nuevo
                vm.estado = nextStado;
                if(vm.fnChange)
                    vm.fnChange(vm.estado);
                console.log("redux " + vm.estado.id);
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
    cerrar()
    {
        let vm = this;
        //paramos anterior
        vm.stopDispatcher();
        //borramos anterior
        if(vm.estado.destroy)
        {
            vm.estado.destroy();

        } 
    }
    canGo(logicas :  LogicEstado[], eActual : Estado, action:number) :  number
    {

        let includes  =  (array : any[], e) :boolean  =>
        {   
            return array.indexOf(e) !== -1;

        } 

        
        for (const l of logicas) {
            if(includes(l.fromEstado, eActual.id) && l.action === action)
            {
                return action;
            }
        }

        return -1;
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
            this.dispatcherId = setInterval(this.estado.dispatcher, time)

        }
    }

}