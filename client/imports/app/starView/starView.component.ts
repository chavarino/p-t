

import { OnInit, OnDestroy, Component, Input } from "@angular/core";
import { isUndefined } from "util";


@Component({
	selector: 'starView',
	templateUrl: 'starView.html',
	styleUrls: ['starView.style.scss']
  })
  export class StarView  implements OnInit, OnDestroy{

		_score : number;
		@Input()
		set score(_score : number)
		{
			this._score = _score;
			this.calculoEstrellas(this._score);
		}

		get score() :number
		{
			return this._score;
		}
		descCampo: string = "desNombre";
		combo = [];
		enteras = [];
		
		vacias = [];
		estrella = {};
		
	 calculoEstrellas = function(ampScore) {
		let vm=this;
            //let ampScore = 2.4;
            if(isUndefined(ampScore) || ampScore<0)
            {
            	return ;
            }
            let entero = Math.floor(ampScore);
            let decimal = ampScore - entero;
            let max = 5;
           
            if(decimal>0)
            {

            	entero++;
	            decimal =Math.floor(decimal*100);
	            
	            this.estrella = {
	                "background": "-webkit-linear-gradient(0deg, blue, white)",
	                "background": `linear-gradient(to right, #ffaf38, #ffaf38 ${decimal+6}%, white ${decimal+7}%, white)`,
	                "-webkit-background-clip":"text",
	                "-webkit-text-fill-color": "transparent"
	            }
            }
            
            /*if(decimal >= 0.5) {
               // let flag= true
                
            
            } */
           

            this.enteras = new Array(entero);
            
            this.vacias =  new Array(Math.max(max-entero+1, 1));
        
        }


		/*$onChanges = function (){


			vm.calculoEstrellas(vm.score);
		*/
	
	

		styleSVacia = function()
		{
			let vm=this;
				return {'margin-left': vm.startMargin ? vm.startMargin + 'px' : '-14px'}; 
		}


	ngOnInit(): void {
		let vm=this;
		
	}	
	
	ngOnDestroy(): void {
	
	}


  }
/*
require("./starView.style.scss");

let starView = {

	bindings: {
      score: "<",
      startMargin : "@"
    },
	controller : starViewController,
	controllerAs: "vm",
	templateUrl: starViewTemplate


};
starView.$inject  = [];

export default starView;


*/