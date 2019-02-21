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
    remoteVideoId : string,

   
}

function onError(error) {
    console.error(error);
  }

export class RtcService {

    //roles : Map<Rol>

    configuration :object = {
        iceServers: [{
          urls: 'stun:stun.l.google.com:19302'
        }]
    }
    
    negotiating :boolean;
    rct :  Rtc
    mostrarCont : boolean;
    remoteVideo;
    localVideo;
    contructor()
    {
        
      
        this.rct = {
          localVideoId : "",
          remoteVideoId: "",
          singalSender : null
        }
        this.mostrarCont = false;
    }

    
    static newRtc(localVideoId : string, remoteVideoId : string, singalSender : (Message) =>void)
    {
        let rtc : RtcService = new RtcService();
        rtc.rct = {
          localVideoId : localVideoId,
          remoteVideoId: remoteVideoId,
          singalSender : singalSender
        }

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
    async localDescCreated(desc  :RTCSessionDescriptionInit) {

      /*  this.rct.pc.setLocalDescription(
          desc,
          () => sendMessage({'sdp': pc.localDescription}),
          onError
        );*/
        let vm =this;

        
        await  this.rct.pc.setLocalDescription(desc)
        vm.rct.localDes = vm.rct.pc.localDescription.sdp;
        vm.sendMessage(vm.newMsg(MsgTipo.SDP, vm.rct.pc.localDescription.toJSON()));
          
      }


      startWebRTC() {

        let vm =this;
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
            vm.sendMessage(vm.newMsg( MsgTipo.CANDIDATE, null,event.candidate.toJSON()));
          }
        };
      
        // If user is offerer let the 'negotiationneeded' event create the offer
          
          pc.onnegotiationneeded = async () => {

            if (vm.negotiating) return;
            if (pc.signalingState != "stable") return;
            vm.negotiating = true;


            //pc.createOffer().then((desc  :RTCSessionDescriptionInit) => vm.localDescCreated(desc)).catch(onError);
            try {
              await pc.setLocalDescription(await pc.createOffer());
              vm.localDescCreated(pc.localDescription)
            } catch (err) {
              console.error(err);
            } finally {
              vm.negotiating = false;
            }
          }
        
      
        // When a remote stream arrives display it in the #remoteVideo element
        pc.ontrack = event => {
          const stream = event.streams[0];
          if (!remoteVideo.srcObject || remoteVideo.srcObject.id !== stream.id) {
            remoteVideo.srcObject = stream;
          }
        };
      
       
        this.mediaUser(vm.localVideo, pc);
        //vm.rct.singalGetter = (msg : MessageRtc) => vm.getMsg(msg);
      
       this.mostrarCont = true;
      }



   async getMsg(msg : MessageRtc)
    {

        let vm=this;
        let pc = vm.rct.pc;

          try {
            if (msg.msgTipo === MsgTipo.SDP) {
              
              // if we get an offer, we need to reply with an answer
              if (msg.sdp.type === 'offer') {
                await pc.setRemoteDescription(msg.sdp as RTCSessionDescriptionInit);

                this.mediaUser(vm.localVideo, pc);
               // 
               /* pc.createAnswer()
                .then((desc  :RTCSessionDescriptionInit) =>
                vm.localDescCreated(desc)).catch(onError);*/
//              
                vm.localDescCreated(await pc.createAnswer())
               // await pc.setLocalDescription(await pc.createAnswer());
                //console.log(pc.localDescription);
               
              } else if (msg.sdp.type === 'answer') {
                await pc.setRemoteDescription(msg.sdp as RTCSessionDescriptionInit).catch(err => console.log(err));
              } else {
                console.log('Unsupported SDP type.');
              }
            } else if (msg.msgTipo === MsgTipo.CANDIDATE) {
              await pc.addIceCandidate(new RTCIceCandidate(msg.candidate )).catch(err => console.log(err));
            }
          } catch (err) {
            console.error(err);
          }
    }

   async  mediaUser(localVideo: any, pc: RTCPeerConnection) {
     

     const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
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
      vm.rct.pc.close();
    }


}


/*


let keys: keyof Map<number>; // string
let value: Map<number>['foo']; // numb*/