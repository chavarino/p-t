
class Elo {
    eloIni =1000;
    eloTotal = 1000;
    i = 0;
    notas = [];
    dTipicaI = 0;
    mediaI = 0;
    score = 0;
    factor = 20;
    
    racha = {
      maxScoreRacha : 200,
      score :5
    }
    factorInit ={
        positivo : 20,
        mal : 100,
        muyMal :  150
    }
    maxScoreTotal = 300;
    maxElo = 7000;
    minElo =0;
    ref = 3;
    scoreRacha = 0;

    logueo  : string  ="";
add(nota)
{
    this.i++;
    this.notas.push(nota);
}

media()
{
    let res = this.notas.reduce((res, vActual)=>{
        return res + vActual;
    },0)

    return res / this.i;
}

desTipica(media ?: number)
{
    if(!media && media!==0)
    {
        media = this.media();
    }

    let res = this.notas.reduce((res, vActual)=>{

        return res + Math.pow(vActual-media, 2);
    },0)
    
    return Math.sqrt(res/this.i); 
}


calcularRacha() :number
{
  let vm= this;
 
  
  let ultimaNota = this.notas[this.notas.length-1]-this.ref;
  if(ultimaNota===0)
  {
    return 0;
  }

  let signo = 1;
  if(ultimaNota <0 )
  {
    signo = -1;
  }

  
  let numRacha = 1;
  
  for(let i = this.notas.length-2; i>=0; i--)
  {
    let n = this.notas[i]-vm.ref;

    if(n>=0 && signo<0 || n<=0 && signo>0)
    {
      //pierde racha
      break;

    }

    numRacha++;
  }
  this.logueoCol("numero de rachas: " + numRacha);
 
  if(signo>0)
  {
    return Math.min(this.racha.score * numRacha , this.racha.maxScoreRacha) * signo ;
  }
  else{
    return this.racha.score * numRacha *3  * signo ;
  }
  
  
}

logueoCol(col)
{
    this.logueo = this.logueo + `${col}\n`;
    console.log(col);
}

calcularElo()
{

    //si la ultima nota sacada es muy baja y tiene un factor mayor
    let ultimaNota = this.notas[this.notas.length-1];
    this.mediaI = this.media();
    this.dTipicaI =  this.desTipica();
    this.logueoCol("nota: " +ultimaNota);
    this.logueoCol(`i = ${this.i} ----------------`);
    this.logueoCol(`media = ${this.mediaI}`);
    this.logueoCol(`Raiz(Varianza) = ${this.dTipicaI}`);
    
    switch(ultimaNota-3)
    {
      case -1 :
      this.factor = this.factorInit.mal
      this.logueoCol("MAL " + this.factor);
      
      break;
      case -2 :
      this.factor = this.factorInit.muyMal
      this.logueoCol("Muy MAL " + this.factor);
         break;
         default:
         this.factor = this.factorInit.positivo;
            this.logueoCol("Positivo " + this.factor);
            
         break;
        }
        
      


      let scoreRacha = this.calcularRacha();
      this.logueoCol("scoreRacha :" +scoreRacha);
  
      
      this.score = this.factor *(this.mediaI * 0.2  + ultimaNota * 0.8  -this.ref) +  scoreRacha;
      let dTipica = this.score <0 ? 0 :this.dTipicaI;
      
      this.eloTotal = this.eloTotal +  (ultimaNota === this.ref ? 0 : this.score)/ (1+dTipica) ;

      this.logueoCol(`score = ${this.score}`);
      this.logueoCol(`score/Varianza = ${(ultimaNota === this.ref ? 0 : this.score)/ (1+dTipica)}`);
      
      if(this.eloTotal>this.maxElo)
      {
        this.logueoCol(`Elo maximo  = ${this.maxElo}`);
        this.eloTotal = this.maxElo;
      }
      else if(this.eloTotal<this.minElo)
      {
        this.logueoCol(`Elo minimo  = ${this.minElo}`);
        this.eloTotal = this.minElo;
      }
      this.logueoCol(`Elo Total = ${this.eloTotal}`);
      this.logueoCol("***********************")
   
    return  this.eloTotal;
}

toString()
{
  let ultimaNota = this.notas[this.notas.length-1];
     let dTipica = this.score <0 ? 0 :this.dTipicaI;
    console.log(`i = ${this.i} ----------------`);
    console.log(`media = ${this.mediaI}`);
    console.log(`Raiz(Varianza) = ${this.dTipicaI}`);
    console.log(`Factor = ${this.factor}`)
    console.log(`score = ${this.score}`);
    console.log(`score/Varianza = ${(ultimaNota === this.ref ? 0 : this.score)/ (1+dTipica)}`)
    console.log(`Elo Total = ${this.eloTotal}`);

}

}

/*
simular()
{

   let elo : Elo = new Elo();

   let  tam = 100;

    for(let i = 1 ; i<=tam ; i++)
    {
       let nota = Math.floor( i%10 === 0 ? Math.random()*3 +1 : Math.random()*(5-4+1)+4);
     
        elo.add(nota);
        elo.calcularElo();
       // elo.toString();
        
    }

    console.log(elo.logueo);

}*/