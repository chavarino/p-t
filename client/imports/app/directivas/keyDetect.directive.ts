import { Directive, HostListener, Input } from "@angular/core";

@Directive({selector: '[keyDectect]'})
export class KeyDectect {

    @Input("fn") fn: (event: KeyboardEvent)=> void;

    @HostListener('keydown', ['$event']) onKeydownHandler(event: KeyboardEvent) {

        
        console.log(event);
        
        if(this.fn)
        {
            this.fn(event)
        }
    }
}