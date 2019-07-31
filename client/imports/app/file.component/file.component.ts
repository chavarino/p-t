import { Component, EventEmitter, ViewChild, ElementRef } from "@angular/core";

export interface FilesI {

    filename :string,
    filetype : string,
    valueUrl : string,
    valueB64 : string,
    size : number

}

@Component({
    selector: 'fileInput',
    outputs: [ 'onSelectFile' ],
    inputs:["multiple"],
    templateUrl: "file.html",
    styleUrls: ['file.scss']
    
  })
  export class FileInput {
    onSelectFile: EventEmitter<Array<FilesI>> = new EventEmitter<Array<FilesI>>();
    multiple : boolean = false;


  loading: boolean = false;

    @ViewChild('fileInput') fileInput: ElementRef;

    constructor() {
        
    }

    openFileSelector()
    {
        let vm=this;
        
        
        this.fileInput.nativeElement.click();
    }

    async onFileChange(event) {

        this.loading =true;
        let reader = new FileReader();
        if(event.target.files && event.target.files.length > 0) {
            let files = event.target.files;
            let filesOut : Array<FilesI> = [];    
            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                let fileLoaded : FilesI = await new Promise((resolve, reject)=>{

                    try {
                        reader.readAsDataURL(file);
                        reader.onload = () => {

                            let fileUrl :string = reader.result as string;
                            resolve({
                                filename: file.name,
                                filetype: file.type,
                                valueUrl: fileUrl,
                                valueB64 : fileUrl.split(',')[1],
                                size : file.size
                                } as FilesI)
                        };
                        
                    } catch (error) {
                        reject(undefined)
                    }

                })

                if(fileLoaded)
                {
                    filesOut.push(fileLoaded)
                }
                
            }

            if(filesOut && filesOut.length>0)
            {

                this.onSelectFile.emit(filesOut);
                this.clearFile()
            }
            this.loading = false;
        }
    }



    clearFile() {
      
        this.fileInput.nativeElement.value = '';
    }
  }
  