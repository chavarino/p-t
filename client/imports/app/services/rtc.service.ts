import { Injectable } from '@angular/core';
import {MessageRtc, MsgTipo,sdpMsg, candidateMsg} from '../../../../imports/models/message'

import * as $ from "jquery/dist/jquery.min.js"//'jquery';
import { v } from '@angular/core/src/render3';
import { isUndefined } from 'util';
//import { Message } from '@angular/compiler/src/i18n/i18n_ast';
/*interface Map<T> {
    [key: string]: T;
}
*/

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

enum VideoType {
  CAM = 1,
  SCREEN = 2
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
    private configuration :object = {
        iceServers: [{
          urls: 'stun:stun.l.google.com:19302'
        }]
    }
    private videoType : VideoType = VideoType.CAM;
    negotiating :boolean;
    rct :  Rtc
    
    remoteVideo;
    localVideo;
    stream : MediaStream
    switchVideo : Map<VideoType, MediaStreamTrack>;
    
    caller : boolean;
    videoSender : RTCRtpSender;
    contructor()
    {
        
      
        this.rct = {
          localVideoId : "",
          remoteVideoId: "",
          singalSender : null
        }
        
    }

    isConnected() :boolean
    {
      let vm= this;
      if(!vm.rct || !vm.rct.pc)
      {
        return false;
      }
      else
      {
        return vm.rct.pc.connectionState === "connected";

      }
    }
    static newRtc(localVideoId : string, remoteVideoId : string, singalSender : (Message) =>void, caller:boolean, handlerConnected : ()=>void)
    {
        let rtc : RtcService = new RtcService();
        rtc.rct = {
          localVideoId : localVideoId,
          remoteVideoId: remoteVideoId,
          singalSender : singalSender,
          handlerConnected : handlerConnected
        }
        rtc.caller = caller;
      
       return rtc;
    }
    newMsg( tipo:MsgTipo, sdp ?: object, candidate ?: object) : MessageRtc
    {
        return   {
            msgTipo : tipo,
            sdp : sdp as sdpMsg,
            candidate : candidate as candidateMsg
        }
    }

    sendMessage(msg : MessageRtc)
    {
        this.rct.singalSender(msg)
    }
    async localDescCreated(desc : RTCSessionDescriptionInit) {

      /*  this.rct.pc.setLocalDescription(
          desc,
          () => sendMessage({'sdp': pc.localDescription}),
          onError
        );*/
        let vm =this;
        console.log("setLocalDescription - type: " + desc.type);
        await vm.rct.pc.setLocalDescription(desc);
        //await  this.rct.pc.setLocalDescription(desc)
        console.log("send MSG local Description");
       // vm.rct.localDes = vm.rct.pc.localDescription.sdp;
        vm.sendMessage(vm.newMsg(MsgTipo.SDP, vm.rct.pc.localDescription.toJSON()));
          
      }


      startWebRTC() {

        let vm =this;
        console.log("Inicia RTCPeerConection");
        //this.setVideoTypeScreen();
        this.rct.pc = new RTCPeerConnection(this.configuration);
        let pc = this.rct.pc;

        
        //document.getElementById("demo")
        /*
        document.getElementById("remoteId"),
        localVideo =  document.getElementById("localId") ;//*/
        let remoteVideo =  $("#remoteId")[0],  localVideo = $("#localId")[0]
        vm.remoteVideo = remoteVideo ;
        vm.localVideo =  localVideo;
       
        // 'onicecandidate' notifies us whenever an ICE agent needs to deliver a
        // message to the other peer through the signaling server
        
        pc.onconnectionstatechange  = function(event) {
          if (vm.isConnected() && vm.rct.handlerConnected) {
            // Handle the failure
            vm.rct.handlerConnected();
          }
        };
        pc.onicecandidate = event => {
          if (event.candidate) {
            console.log("Send Candidate");
            vm.sendMessage(vm.newMsg( MsgTipo.CANDIDATE, null,event.candidate.toJSON()));
          }
        };
      
        // If user is offerer let the 'negotiationneeded' event create the offer
        vm.negotiating = this.caller ?  false : true;
          pc.onnegotiationneeded = async () => {

            console.log(`signalingState : ${vm.rct.pc.signalingState}, conectionState: ${vm.rct.pc.connectionState}, iceConnectionState: ${vm.rct.pc.iceConnectionState},`);
            if (vm.negotiating) return;
            if (pc.signalingState != "stable") return;
            vm.negotiating = true;
            console.log("stable-TRUE");

            //pc.createOffer().then((desc  :RTCSessionDescriptionInit) => vm.localDescCreated(desc)).catch(onError);
            try {
              
              //EL CALLER GENERA OFERTA => have-local-offer espera un respuesta.
              vm.localDescCreated(await vm.rct.pc.createOffer(vm.offerOptions))
            } catch (err) {
              console.error(err);
            } finally {
              vm.negotiating = false;
            }
          }
        
      
        // When a remote stream arrives display it in the #remoteVideo element
        pc.ontrack = event => {
          if (remoteVideo.srcObject) return;
          
          console.log("Remote Stream");
          remoteVideo.srcObject = event.streams[0];
          
        };
      
       
        this.mediaUser();
        //vm.rct.singalGetter = (msg : MessageRtc) => vm.getMsg(msg);
      
       
      }



   async getMsg(msg : MessageRtc)
    {

        let vm=this;
        let pc = vm.rct.pc;
        console.log(`signalingState : ${vm.rct.pc.signalingState}, conectionState: ${vm.rct.pc.connectionState}, iceConnectionState: ${vm.rct.pc.iceConnectionState},`);
          try {
            if (msg.msgTipo === MsgTipo.SDP) {
              
              console.log(`SDP ${msg.sdp.type}`);
              // if we get an offer, we need to reply with an answer
              if (msg.sdp.type === 'offer') {

       
                //EL CALLEr Obtiene una oferta set remote with offer => genera una respuesta y se pone el local have-remote-offer =>> estable
                  await pc.setRemoteDescription(msg.sdp as RTCSessionDescriptionInit);
                  vm.localDescCreated(await pc.createAnswer())
                

               //this.mediaUser(vm.localVideo, pc);
               // 
               /* pc.createAnswer()
                .then((desc  :RTCSessionDescriptionInit) =>
                vm.localDescCreated(desc)).catch(onError);*/
//              
               // await pc.setLocalDescription(await pc.createAnswer());
                //console.log(pc.localDescription);
               
              } else if (msg.sdp.type === 'answer') {
                
                  //CALLER esta en have-local-offer = obtiene anserr para set remote => estable
                  await pc.setRemoteDescription(msg.sdp as RTCSessionDescriptionInit).catch(err => console.log(err));

                
              } else {
                console.log('Unsupported SDP type.');
              }
            } else if (msg.msgTipo === MsgTipo.CANDIDATE) {
              console.log(`CANDIDATE `);
              await pc.addIceCandidate(new RTCIceCandidate(msg.candidate )).catch(err => console.log(err));
            }
          } catch (err) {
            console.error(err);
          }
    }

    setVideoTypeScreen()
    {
        this.videoType = VideoType.SCREEN
    }
    setVideoTypeCam()
    {
      this.videoType =VideoType.CAM;
    }
   async  mediaUser() {
     
    let vm=this;
    console.log("User Media Stream");
 
    // TODO   meterle compartir pantalla : https://webrtc.github.io/samples/src/content/getusermedia/getdisplaymedia/
    // https://webrtc.github.io/samples/src/content/devices/multi/
    //let  stream;
    
    let stream;
    let videoTrackAux :MediaStreamTrack  =  vm.switchVideo[this.videoType];


    //guardar trak.
    let fnGuardarTrack = ()=>
    {
        videoTrackAux = stream.getVideoTracks()[0];
        videoTrackAux.onended = ()=>
        {
          videoTrackAux.stop();
          videoTrackAux = null;
        }

        //se rellena el switch de videos.
        vm.switchVideo[this.videoType] = videoTrackAux;

      }
    //si es la primera vez o se a roto el trak de video de cam  => genera el estream base de cam
    if(!vm.stream || 
      this.videoType === VideoType.CAM && (!videoTrackAux || videoTrackAux.readyState === "ended"))
    {
      //se genera el stream user media.
      stream  = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      //si es la primera vez se inserta el stream base.
      if(!vm.stream)
      {
        vm.stream = stream;
        vm.stream.getTracks().forEach((track) => {
          console.log(`adding ${track.kind} track`);
          let sender =vm.rct.pc.addTrack(track, vm.stream)
          if(track.kind=="video")
          {
            vm.videoSender = sender;
          }
        });
      }

      //guarda el trak.
      fnGuardarTrack();
      
    }
    
    if(this.videoType !== VideoType.CAM && (!videoTrackAux || videoTrackAux.readyState === "ended"))
    {
      if(this.videoType === VideoType.SCREEN )
      {
          
            if (navigator.getDisplayMedia) {
              stream = await navigator.getDisplayMedia({video: true});
            } else if (navigator.mediaDevices.getDisplayMedia) {
              stream = await navigator.mediaDevices.getDisplayMedia({video: true});
            } else {
              stream = await navigator.mediaDevices.getUserMedia({video: {mediaSource: 'screen'},});
            }
            
      }
      fnGuardarTrack();
          
    }
      //GENERAR EL MUTE.
      
      //NO PERDER EL STREAM y CERRARLO.
      if(vm.videoSender.track.id !== videoTrackAux.id)
      {
        vm.setActiveTracks(false);
        await vm.videoSender.replaceTrack(videoTrackAux);
        vm.setActiveTracks(true);
        vm.localVideo.srcObject = vm.stream;
      }
     
      
    }


    switchVideoMute(flag ?: boolean)
    {
      let  vm= this;
      let trackVideo = vm.stream.getVideoTracks()[0];
      if(isUndefined(flag))
      {
         flag  = !trackVideo.enabled;
      }
      trackVideo.enabled =  flag; 
    }

    switchAudioMute(flag ?: boolean)
    {
      let  vm= this;
      let trackAudio = vm.stream.getAudioTracks()[0];
      if(isUndefined(flag))
      {
         flag  = !trackAudio.enabled;
      }
      trackAudio.enabled =  flag; 
    }


    setActiveTracks(flag :boolean)
    {
      let vm=this;
      vm.stream.getTracks().forEach(function (track) { track.enabled = flag; });
    }
     close()
    {
      let vm=this;
      console.log("Close");
      vm.negotiating = false;
      
     // await vm.rct.pc.setRemoteDescription(null);
    // await vm.rct.pc.setLocalDescription(null);
      this.closeTracks();
      vm.rct.pc.close();
      
    }



  private closeTracks() {
    let vm=this;
    vm.stream.getTracks().forEach(function (track) { track.stop(); });
    vm.switchVideo.forEach((e :MediaStreamTrack) =>
    {
        e.stop();
    })
    vm.switchVideo = null;
  }
}


/*


let keys: keyof Map<number>; // string
let value: Map<number>['foo']; // numb*/