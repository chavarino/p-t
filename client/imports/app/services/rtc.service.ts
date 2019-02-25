import { Injectable } from '@angular/core';
import {MessageRtc, MsgTipo,sdpMsg, candidateMsg} from '../../../../imports/models/message'

import * as $ from "jquery/dist/jquery.min.js"//'jquery';
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
    localVideoId : string,
    remoteVideoId : string
    

   
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
    
    negotiating :boolean;
    rct :  Rtc
    mostrarCont : boolean;
    remoteVideo;
    localVideo;
    stream : MediaStream
    caller : boolean;
    contructor()
    {
        
      
        this.rct = {
          localVideoId : "",
          remoteVideoId: "",
          singalSender : null
        }
        this.mostrarCont = false;
    }

    
    static newRtc(localVideoId : string, remoteVideoId : string, singalSender : (Message) =>void, caller:boolean)
    {
        let rtc : RtcService = new RtcService();
        rtc.rct = {
          localVideoId : localVideoId,
          remoteVideoId: remoteVideoId,
          singalSender : singalSender
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
      
       
        this.mediaUser(vm.localVideo, pc);
        //vm.rct.singalGetter = (msg : MessageRtc) => vm.getMsg(msg);
      
       this.mostrarCont = true;
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

   async  mediaUser(localVideo: any, pc: RTCPeerConnection) {
     
    let vm=this;
    console.log("User Media Stream");
     const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

    vm.stream = stream;
     localVideo.srcObject = stream;
     stream.getTracks().forEach((track) => {
       console.log(`adding ${track.kind} track`);
       pc.addTrack(track, stream)
     });

        /*navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        }).then(stream => {
            // Display your local video in #localVideo element
            localVideo.srcObject = stream;
            // Add your stream to be sent to the conneting peer
            stream.getTracks().forEach(track => pc.addTrack(track, stream));
        }, onError);*/
    }

     close()
    {
      let vm=this;
      console.log("Close");
      vm.negotiating = false;
      
     // await vm.rct.pc.setRemoteDescription(null);
    // await vm.rct.pc.setLocalDescription(null);
      vm.stream.getTracks().forEach(function (track) { track.stop(); });
      vm.rct.pc.close();
      
    }


}


/*


let keys: keyof Map<number>; // string
let value: Map<number>['foo']; // numb*/