import { Injectable } from '@angular/core';
import {MessageRtc, MsgTipo,sdpMsg, candidateMsg} from '../../../../imports/models/message'

import * as $ from "jquery/dist/jquery.min.js"//'jquery';
import { v } from '@angular/core/src/render3';
import { isUndefined } from 'util';
import { forEach } from '@angular/router/src/utils/collection';
import { Log } from 'imports/functions/commonFunctions';
import { isDefined } from '@angular/compiler/src/util';
//import { Message } from '@angular/compiler/src/i18n/i18n_ast';
/*interface Map<T> {
    [key: string]: T;
}
*/

//https://developers.google.com/web/fundamentals/media/recording-video/?hl=es

interface Rtc {
    localDes ?: string,
    remotDes ?: string,
    pc ?: RTCPeerConnection,
    
    singalSender : (MessageRtc) =>void ,
    singalGetter ?: (MessageRtc) =>void ,
    handlerConnected ?: () => void,
    localVideoId : string,
    remoteVideoId : string
    

   
}

enum Navegador {
  CHROME = 1,
  MOZILLA = 2,
  SAFARI = 3
}
export enum VideoType {
  CAM = 1,
  SCREEN = 2
}
export interface DeviceInterface {
  id : string,
  label :string,
  kind : string
}
export interface DevicesMapInterface {
   audioInputs: Array<DeviceInterface>, audioOutputs: Array<DeviceInterface>, videoInputs : Array<DeviceInterface>

}
enum SoundType {
  MICRO = 1
 
}
function onError(error) {
    console.error(error);
  }

export class RtcService {

    //roles : Map<Rol>
   private offerOptions : RTCOfferOptions = {
    iceRestart : true,
    offerToReceiveAudio : true,
    offerToReceiveVideo : true
    }

    private navegador : Navegador = -1;
    private audioConfig = {   
      echoCancellation: true,
      autoGainControl: true,
      latency : { min:  0.100 , ideal: 0.200  , max: 0.250   },
      noiseSuppression: true
      
      };
    private videoConfig =     {
      width: { min: 640, ideal: 1920, max: 1920 },
      height: { min: 400, ideal: 1080 },
      //aspectRatio: 1.777777778,
      frameRate: { max: 30 },
      //facingMode: { exact: "user" }
    };
    private static configuration  = {
        iceServers: [{
          urls: 'stun:stun.l.google.com:19302'
       
        }]
    }
    private videoType : VideoType = VideoType.CAM;
    negotiating :boolean;
    rtc :  Rtc
    
    remoteVideo;
    localVideo;
    stream : MediaStream
    switchVideo : Map<VideoType, MediaStreamTrack>;
    trasmitiendo : boolean ;
    caller : boolean;
    videoSender : RTCRtpSender;
    remoteVideoTrack : MediaStreamTrack;
    l: Log = new Log(RtcService.module, Meteor.userId());
    static module :string = "RtcService";

   static  devices : {
      audioInput ?: DeviceInterface, audioOutput ?: DeviceInterface, videoInput ?: DeviceInterface
    } = {

    }

    cancelarScreen: ()=>void;
    contructor()
    { 
 
        
        this.rtc = {
          localVideoId : "",
          remoteVideoId: "",
          singalSender : null
        }
        
    }


    static pushServers(servers)
    {

      Log.logStatic(this.module, "pushServers: " + JSON.stringify(servers))
      
      this.configuration.iceServers.push(...servers)
      //this.configuration.iceServers = servers;
      //for(;this.configuration.iceServers.length>4;) this.configuration.iceServers.pop();
    }
    isConnected() :boolean
    {
     // this.l.log("isConnected Ini");
      let vm= this;
      if(!vm.rtc || !vm.rtc.pc)
      {

       // this.l.log("isConnected False");
        return false;
      }
      else
      {

        //this.l.log("isConnected True");
	      //this.l.log("Estado de conexion: " + vm.rct.pc.connectionState);
        return  (vm.navegador=== Navegador.MOZILLA || vm.navegador=== Navegador.SAFARI) && vm.trasmitiendo || vm.rtc.pc.connectionState === "connected";

      }
    }
/*
function start() {
  if (window.stream) {
    window.stream.getTracks().forEach(track => {
      track.stop();
    });
  }
  const audioSource = audioInputSelect.value;
  const videoSource = videoSelect.value;
  const constraints = {
    audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
    video: {deviceId: videoSource ? {exact: videoSource} : undefined}
  };
  navigator.mediaDevices.getUserMedia(constraints).then(gotStream).then(gotDevices).catch(handleError);
}*/


/*

*/

  //output audio 

attachSinkId(element, sinkId) {
  if (typeof element.sinkId !== 'undefined') {
    element.setSinkId(sinkId)
        .then(() => {
          console.log(`Success, audio output device attached: ${sinkId}`);
        })
        .catch(error => {
          let errorMessage = error;
          if (error.name === 'SecurityError') {
            errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
          }
          console.error(errorMessage);
          // Jump back to first output device in the list as it's the default.
          //RtcService.devices.audioInput.id = 0;
        });
  } else {
    console.warn('Browser does not support output device selection.');
  }
}

changeAudioDestination(videoId) {
  if(RtcService.devices.audioInput)
  {
    const audioDestination = RtcService.devices.audioInput.id;
    this.attachSinkId(document.querySelector(videoId), audioDestination);

  }
}


    static async getDevices() : Promise<DevicesMapInterface>
    {

      let devices : DevicesMapInterface = {
        audioInputs: [],
        audioOutputs: [],
        videoInputs: []
      };
      let deviceInfos = await navigator.mediaDevices.enumerateDevices();
     let device : DeviceInterface;
      for (let i = 0; i !== deviceInfos.length; ++i) {
        const deviceInfo = deviceInfos[i];
        device ={ 
          id: deviceInfo.deviceId,
          kind: deviceInfo.kind,
          label: ""
          
        }
       
        if (deviceInfo.kind === 'audioinput') {
          devices.audioInputs.push(device)
          device.label = deviceInfo.label || `microphone ${devices.audioInputs.length}`;
        } else if (deviceInfo.kind === 'audiooutput') {
         
          devices.audioOutputs.push(device)
          device.label = deviceInfo.label || `speaker ${devices.audioOutputs.length}`;
        } else if (deviceInfo.kind === 'videoinput') {
         
          devices.videoInputs.push(device)
          device.label = deviceInfo.label || `camera ${devices.videoInputs.length}`;
        } else {
          console.log('Some other kind of source/device: ', deviceInfo);
        }
      }

      return devices;

    }

    static async getPermisos(fn : (boolean)=>void)
    {
        try{
          Log.logStatic(this.module, "getPermisos: getUserMedia INI");
           let stream =await navigator.mediaDevices.getUserMedia(RtcService.getConstraint());
          
        Log.logStatic(this.module, "getPermisos: getUserMedia OK");
        stream.getTracks().forEach(function (track) { track.stop(); });
          fn(true);
        }
        catch(e)
        {

          Log.logStatic(this.module, "getPermisos: getUserMedia ERROR " + e, true);
          fn(false);
        }
    }
    
    static newRtc(localVideoId : string, remoteVideoId : string, singalSender : (Message) =>void, caller:boolean, handlerConnected : ()=>void)
    {

      Log.logStatic(this.module, "newRtc: definiendo");
        let rtc : RtcService = new RtcService();
        rtc.rtc = {
          localVideoId : localVideoId,
          remoteVideoId: remoteVideoId,
          singalSender : singalSender,
          handlerConnected : handlerConnected
        }
        rtc.caller = caller;
        
        rtc.switchVideo = new Map();;
        Log.logStatic(this.module, "newRtc: OK");
       return rtc;
    }
    newMsg( tipo:MsgTipo, sdp ?: object, candidate ?: object) : MessageRtc
    {
        let json =  {
            msgTipo : tipo,
            sdp : sdp as sdpMsg,
            candidate : candidate as candidateMsg

            
        }

        this.l.log("newMsg "+ JSON.stringify(json));

        return json;
    }

    sendMessage(msg : MessageRtc)
    {
        this.l.log("sendMessage "+ JSON.stringify(msg));
        this.rtc.singalSender(msg)
    }
    async localDescCreated(desc : RTCSessionDescriptionInit) {

      /*  this.rct.pc.setLocalDescription(
          desc,
          () => sendMessage({'sdp': pc.localDescription}),
          onError
        );*/
        let vm =this;
        this.l.log("localDescCreated setLocalDescription - type: " + desc.type);
        
        await vm.rtc.pc.setLocalDescription(desc);
 
        vm.sendMessage(vm.newMsg(MsgTipo.SDP, vm.rtc.pc.localDescription.toJSON()));
          
      }


      startWebRTC(recconect ?: boolean) {

        let vm =this;
        if(navigator.userAgent.includes("Mozilla"))
        {
          this.navegador = Navegador.MOZILLA
        }
        else if(navigator.userAgent.includes("Chrome"))
        {
          this.navegador = Navegador.CHROME
        }
        else  {
          this.navegador = Navegador.SAFARI;
        }

        this.trasmitiendo = false;
        this.l.log("startWebRTC  INI");
        //this.setVideoTypeScreen();
        this.rtc.pc = new RTCPeerConnection(RtcService.configuration);
        let pc = this.rtc.pc;
        this.l.log("startWebRTC  RTCPeerConnection conf: "+ JSON.stringify(RtcService.configuration));
        
        //document.getElementById("demo")
        /*
        document.getElementById("remoteId"),
        localVideo =  document.getElementById("localId") ;//*/
        let remoteVideo =  $("#remoteId")[0],  localVideo = $("#localId")[0]
        vm.remoteVideo = remoteVideo ;
        vm.localVideo =  localVideo;
        vm.localVideo.muted = true;
        this.l.log("startWebRTC  RTCPeerConnection  conf HTML video: ");
        
        let iniRtc = ()=>{

          // 'onicecandidate' notifies us whenever an ICE agent needs to deliver a
          // message to the other peer through the signaling server
          this.l.log("startWebRTC  iniRtc().");

          pc.oniceconnectionstatechange = function(event) {
            console.log("ESTADO ICE CONECTION" +  pc.iceConnectionState+  " - " +JSON.stringify(event))
            if (pc.iceConnectionState === "failed") {
              /* possibly reconfigure the connection in some way here */
              /* then request ICE restart */
              console.log("REINICIAR")
              vm.reiniciar()
            }
          };
          pc.onconnectionstatechange  = function(event) {

            vm.l.log("ESTADO: rtc  onconnectionstatechange(). " + JSON.stringify(event));
            if (vm.isConnected() && vm.rtc.handlerConnected) {
              // Handle the failure
              vm.l.log("rtc  onconnectionstatechange(). isConnected ");
              vm.rtc.handlerConnected();
            }
          };
          pc.onicecandidate = event => {

            vm.l.log("rtc  onicecandidate() ini");
            if (event.candidate) {
              vm.l.log("rtc  onicecandidate() event.candidate ");
              vm.l.log("rtc  onicecandidate() Send Candidate");
             
              vm.sendMessage(vm.newMsg( MsgTipo.CANDIDATE, null,event.candidate.toJSON()));
            }
          };
        
          // If user is offerer let the 'negotiationneeded' event create the offer
          vm.negotiating = this.caller /*|| recconect */?  false : true;
            pc.onnegotiationneeded = async () => {
              vm.l.log(`rtc onnegotiationneeded() signalingState : ${vm.rtc.pc.signalingState}, conectionState: ${vm.rtc.pc.connectionState}, iceConnectionState: ${vm.rtc.pc.iceConnectionState},`);
              
              if ( vm.negotiating) return;

              vm.l.log("rtc onnegotiationneeded() negotiating" );
              vm.l.log("rtc onnegotiationneeded() pc.signalingState=" +pc.signalingState );
              if (pc.signalingState != "stable") return;
              recconect =false;
              vm.negotiating = true;
              
              vm.l.log("rtc onnegotiationneeded() stable-TRUE" );
              //pc.createOffer().then((desc  :RTCSessionDescriptionInit) => vm.localDescCreated(desc)).catch(onError);
              try {
                vm.l.log("rtc onnegotiationneeded() createOffer..." );
                //EL CALLER GENERA OFERTA => have-local-offer espera un respuesta.
                 this.sendOffer();
                vm.l.log("rtc onnegotiationneeded() createOffer...OK" );
              } catch (err) {

                vm.l.log("rtc onnegotiationneeded() ERROR: " +err, true );
                throw err;
              } finally {
                vm.negotiating = false;
              }
            }
          
        
          // When a remote stream arrives display it in the #remoteVideo element
          pc.ontrack = event => {

            if(this.navegador===Navegador.MOZILLA || this.navegador===Navegador.SAFARI)
            {
              event.track.onunmute = () => {
                // if (remoteVideo.srcObject) return;
                vm.l.log("navegador MOZILLA  || SAFARI\n rtc ontrack() Remote Stream");
                console.log('track unmuted');
                remoteVideo.srcObject = event.streams[0];
                vm.remoteVideoTrack = event.streams[0].getVideoTracks()[0]
                vm.l.log("rtc ontrack() OK");
                vm.trasmitiendo =true;
              }

            }
            else{
              vm.l.log("CHROME \n rtc ontrack() Remote Stream");
              remoteVideo.srcObject = event.streams[0];
              vm.remoteVideoTrack = event.streams[0].getVideoTracks()[0]

              vm.l.log("rtc ontrack() OK");
            }
           
          };
        }
        try {
          
          

          
          this.l.log("startWebRTC  mediaUser.");
          this.mediaUser(iniRtc);

        } catch (error) {
          
            //TODO CONTROLAR
            this.l.log("startWebRTC  ERROR " + error, true);
            throw error;
    
        }
      
       
        
        //vm.rct.singalGetter = (msg : MessageRtc) => vm.getMsg(msg);
      
       
      }



   async sendOffer() {
    let vm=this;

    await vm.localDescCreated(await vm.rtc.pc.createOffer(vm.offerOptions));
  }

   async getMsg(msg : MessageRtc)
    {

        let vm=this;
        let pc = vm.rtc.pc;

        this.l.log("getMsg  INI.");

        this.l.log(`signalingState : ${vm.rtc.pc.signalingState}, conectionState: ${vm.rtc.pc.connectionState}, iceConnectionState: ${vm.rtc.pc.iceConnectionState},`);
       
          try {

            this.l.log("getMsg  INI.");
            this.l.log("getMsg  msgTipo." + msg.msgTipo);
            if (msg.msgTipo === MsgTipo.SDP) {
              
              // if we get an offer, we need to reply with an answer
              if (msg.sdp.type === 'offer') {
                
                this.l.log(`getMsg SDP offer` + JSON.stringify(msg.sdp));
       
                this.l.log(`getMsg setRemoteDescription...`);
                //EL CALLEr Obtiene una oferta set remote with offer => genera una respuesta y se pone el local have-remote-offer =>> estable
                  await pc.setRemoteDescription(msg.sdp as RTCSessionDescriptionInit);
                  this.l.log(`getMsg setRemoteDescription ok...`);
                  this.l.log(`getMsg createAnswer - localDescCreated...`);
                  vm.localDescCreated(await pc.createAnswer())
                  this.l.log(`getMsg createAnswer - localDescCreated...OK`);
               //this.mediaUser(vm.localVideo, pc);
               // 
               /* pc.createAnswer()
                .then((desc  :RTCSessionDescriptionInit) =>
                vm.localDescCreated(desc)).catch(onError);*/
//              
               // await pc.setLocalDescription(await pc.createAnswer());
                //console.log(pc.localDescription);
               
              } else if (msg.sdp.type === 'answer') {

                this.l.log(`getMsg  SDP answer`+ JSON.stringify(msg.sdp));
                this.l.log(`getMsg  SDP setRemoteDescription...`);
                  //CALLER esta en have-local-offer = obtiene anserr para set remote => estable
                  await pc.setRemoteDescription(msg.sdp as RTCSessionDescriptionInit)
                  this.l.log(`getMsg  SDP setRemoteDescription...ok`);
                
              } else {
                this.l.log(`getMsg Unsupported SDP type.`);
                
              }
            } else if (msg.msgTipo === MsgTipo.CANDIDATE) {
              this.l.log(`getMsg CANDIDATE `+ JSON.stringify(msg.candidate));

              this.l.log(`getMsg addIceCandidate... `);
              await pc.addIceCandidate(new RTCIceCandidate(msg.candidate ))
              this.l.log(`getMsg addIceCandidate... ok`);
            }
          } catch (err) {
            this.l.log("getMsg " + err, true);
            throw err;
          }
    }
    getVideoType()
    {
      return this.videoType;
    }

    setVideoTypeTo(type : VideoType)
    {
      this.l.log(`setVideoTypeTo type.` + JSON.stringify(type));
      this.videoType = type;
    }
    setVideoTypeScreen()
    {

      this.l.log("setVideoTypeScreen SCREEN");
        this.videoType = VideoType.SCREEN
    }
    setVideoTypeCam()
    {

      this.l.log("setVideoTypeCam CAM");
      this.videoType =VideoType.CAM;
    }

  reiniciar()
  {
    let vm =this;
    vm.negotiating= false;
     // this.close()
      this.startWebRTC();
     // vm.rct.restartIce()

  }
  
    
   async  mediaUser(fn ?: ()=>void) {
     
    let vm=this;
    this.l.log("mediaUser INi");
 
    // TODO   meterle compartir pantalla : https://webrtc.github.io/samples/src/content/getusermedia/getdisplaymedia/
    // https://webrtc.github.io/samples/src/content/devices/multi/
    //let  stream;
    
    let stream;
   
    let videoTrackAux :MediaStreamTrack  =  vm.switchVideo[this.videoType];


    //guardar trak.
    let fnGuardarTrack = ()=>
    {
      this.l.log("mediaUser  fnGuardarTrack");
        videoTrackAux = stream.getVideoTracks()[0];
        videoTrackAux.onended = (info)=>
        {

          videoTrackAux.stop();
          videoTrackAux = null;
          this.l.log("mediaUser  fnGuardarTrack onended stop: " + JSON.stringify(info));
          if(this.videoType=== VideoType.SCREEN && vm.cancelarScreen)
          {
              vm.cancelarScreen();
          }
        }

        //se rellena el switch de videos.
        vm.switchVideo[this.videoType] = videoTrackAux;

    }
    //si es la primera vez o se a roto el trak de video de cam  => genera el estream base de cam
    if(!vm.stream || 
      this.videoType === VideoType.CAM && (!videoTrackAux || videoTrackAux.readyState === "ended"))
    {

      this.l.log("mediaUser getUserMedia CAM...");
      //se genera el stream user media.
      stream  = await navigator.mediaDevices.getUserMedia(RtcService.getConstraint());
      this.l.log("mediaUser getUserMedia CAM...OK");
      //si es la primera vez se inserta el stream base.
      if(!vm.stream)
      {
          vm.stream = stream;
          vm.stream.getTracks().forEach((track) => {
            this.l.log(`mediaUser adding ${track.kind} track`);
          let sender =vm.rtc.pc.addTrack(track, vm.stream)
          if(track.kind=="video")
          {
            this.l.log("mediaUser  track VIDEO");
            vm.changeTrackConfig(track, vm.videoConfig);
            vm.videoSender = sender;
          }
          else{
            this.l.log("mediaUser  track SOUND");
            vm.changeTrackConfig(track, vm.audioConfig);
            
          }
          vm.localVideo.srcObject = vm.stream;
        });
      }

      //guarda el trak.
      fnGuardarTrack();

      
    }
    
    if(this.videoType !== VideoType.CAM && (!videoTrackAux || videoTrackAux.readyState === "ended"))
    {
      if(this.videoType === VideoType.SCREEN )
      {
        this.l.log("mediaUser  SCREEN...");
        if (navigator.getDisplayMedia) {
          stream = await navigator.getDisplayMedia({video: true});
        } else if (navigator.mediaDevices.getDisplayMedia) {
          stream = await navigator.mediaDevices.getDisplayMedia({video: true});
        } else {
          stream = await navigator.mediaDevices.getUserMedia({video: {mediaSource: 'screen'},});
        }
        this.l.log("mediaUser  SCREEN...OK");
      }
      fnGuardarTrack();
      
    }
    //GENERAR EL MUTE.
    
    //NO PERDER EL STREAM y CERRARLO.
    if(vm.videoSender.track.id !== videoTrackAux.id)
    {

      this.l.log("mediaUser  GUARDAR STREAM...");
      vm.setActiveTracks(false);
      await vm.videoSender.replaceTrack(videoTrackAux);
      vm.stream.removeTrack(vm.stream.getVideoTracks()[0])
      vm.stream.addTrack(videoTrackAux);
      vm.setActiveTracks(true);
      vm.localVideo.srcObject = vm.stream;
      this.l.log("mediaUser  GUARDAR STREAM...OK");
    }
    
    if(fn)
    {
      fn();
      
    }
    this.l.log("mediaUser  fin");
    }


  private static getConstraint(): MediaStreamConstraints {
    return {
       audio: isDefined(this.devices.audioInput) ? { deviceId: {exact: this.devices.audioInput.id}} :true,
      video: isDefined(this.devices.videoInput) ? { deviceId: {exact: this.devices.videoInput.id}} :true
     };
    /*{
      audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
      video: {deviceId: videoSource ? {exact: videoSource} : undefined}
    }*/
  }

    switchVideoMute(flag ?: boolean) :boolean
    {

      this.l.log("switchVideoMute  ini");
      let  vm= this;
      let trackVideo = vm.stream.getVideoTracks()[0];
      if(isUndefined(flag))
      {
         flag  = !trackVideo.enabled;
      }
      this.l.log("switchVideoMute flag" + flag);
      trackVideo.enabled =  flag; 
      this.l.log("switchVideoMute FIN");
      return trackVideo.enabled;
    }

    switchAudioMute(flag ?: boolean) :boolean
    {
      let  vm= this;
      this.l.log("switchAudioMute INI");
      let trackAudio = vm.stream.getAudioTracks()[0];
      if(isUndefined(flag))
      {
         flag  = !trackAudio.enabled;
      }
      trackAudio.enabled =  flag; 
      this.l.log("switchAudioMute flag " + trackAudio.enabled);
      this.l.log("switchAudioMute FIN");
      return trackAudio.enabled;
    }


    setActiveTracks(flag :boolean)
    {
      let vm=this;

      this.l.log("setActiveTracks flag " +flag);
      vm.stream.getTracks().forEach(function (track) { track.enabled = flag; });
    }
     close()
    {
      let vm=this;
      this.l.log("close Close");
      vm.negotiating = false;
      vm.trasmitiendo = false;
     // await vm.rct.pc.setRemoteDescription(null);
    // await vm.rct.pc.setLocalDescription(null);
      this.closeTracks();

      vm.rtc.pc.close();
      this.l.log("close FIN");
    }


  private async changeTrackConfig(track : MediaStreamTrack, constraints)
  {
    let vm =this;
    if(!track || !constraints)
    {
      return ;
    }
    /*if (aspectLock.checked) {
      };
    } else {
      constraints = {width: {exact: e.target.value}};
    } */
   // clearErrorMessage();
   this.l.log('changeTrackConfig applying ' + JSON.stringify(constraints));
    try{
      await track.applyConstraints(constraints)
      this.l.log("changeTrackConfig applied Ttrack config")
    }
    catch(e)
    {
      this.l.log("changeTrackConfig Error:" + e, true)    
      throw e;
    }
  }


  private closeTracks() {
    let vm=this;

    try {

      this.l.log("closeTracks stop");
      vm.stream.getTracks().forEach(function (track) { track.stop(); });
  
      Object.keys(VideoType).forEach((e :string) =>{
  
        let i = parseInt(e);
        if(isUndefined(i) || !vm.switchVideo[i] )
        {
         return;
        }
          vm.switchVideo[i].stop();
          vm.switchVideo[i] = null;
  
      })
    
      vm.switchVideo = new Map();;
      this.l.log("closeTracks OK");
    } catch (error) {
      this.l.log("closeTracks Error:" + error, true)    
      throw error;
   }
  }
}


/*


let keys: keyof Map<number>; // string
let value: Map<number>['foo']; // numb*/
