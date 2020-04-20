export class SoundClass {
    sound: HTMLAudioElement;
    
    constructor(src :string, preload: string, controls:string, loop:boolean, styleDisplay: string)
    {
        this.sound = document.createElement("audio");
        this.sound.src = src;
        this.sound.setAttribute("preload", preload);
        this.sound.setAttribute("controls", controls);
        this.sound.loop=loop;
        this.sound.style.display = styleDisplay;
        document.body.appendChild(this.sound);
        
    }
    
    /**
     * Crear HTMLAudioElement configurado para ser tono de llamada: 
     * no visible, auto y en loop desde que se reproduce hasta que se pausa.
     * @param src tono fuente
     */
    static crearTonoLlamada(src: string) : SoundClass
    {

        let llamada : SoundClass = new SoundClass(src, "auto", "none", true, "none");
        
        
        return llamada;
    }

    play() {
      this.sound.play();
    }
    stop() {
      this.sound.pause();
      this.sound.currentTime = 0;
    }
    destroy()
    {
        if(this.sound)
        {
            this.sound.pause();
            this.sound.parentNode.removeChild(this.sound);
        }
    }

}