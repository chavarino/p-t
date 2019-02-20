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
    

    rct :  Rtc
    mostrarCont : boolean;
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
    localDescCreated(desc  :RTCSessionDescriptionInit) {

      /*  this.rct.pc.setLocalDescription(
          desc,
          () => sendMessage({'sdp': pc.localDescription}),
          onError
        );*/
        let vm =this;
        function onSuccess() {

            vm.rct.localDes = vm.rct.pc.localDescription.sdp;
            vm.sendMessage(vm.newMsg(MsgTipo.SDP, vm.rct.pc.localDescription.toJSON()));

        };
       
        this.rct.pc.setLocalDescription(desc)
        .then(onSuccess,
        onError)

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
         
      
        // 'onicecandidate' notifies us whenever an ICE agent needs to deliver a
        // message to the other peer through the signaling server
        
        pc.onicecandidate = event => {
          if (event.candidate) {
            vm.sendMessage(vm.newMsg( MsgTipo.CANDIDATE, null,event.candidate.toJSON()));
          }
        };
      
        // If user is offerer let the 'negotiationneeded' event create the offer
          
          pc.onnegotiationneeded = () => {
            pc.createOffer().then((desc  :RTCSessionDescriptionInit) => vm.localDescCreated(desc)).catch(onError);
          }
        
      
        // When a remote stream arrives display it in the #remoteVideo element
        pc.ontrack = event => {
          const stream = event.streams[0];
          if (!remoteVideo.srcObject || remoteVideo.srcObject.id !== stream.id) {
            remoteVideo.srcObject = stream;
          }
        };
      
        this.mediaUser(localVideo, pc);
      
        //vm.rct.singalGetter = (msg : MessageRtc) => vm.getMsg(msg);
      
       this.mostrarCont = true;
      }



    getMsg(msg : MessageRtc)
    {

        let vm=this;
        let pc = vm.rct.pc;
        if (msg.msgTipo === MsgTipo.SDP) {
            // This is called after receiving an offer or answer from another peer
//msg.sdp as RTCSessionDescriptionInit
            let type : RTCSdpType = msg.sdp.type as RTCSdpType; 
            let inicio : RTCSessionDescriptionInit = {
              sdp : msg.sdp.sdp,
              type : type
            }
            vm.rct.pc.setRemoteDescription(new RTCSessionDescription( inicio))
            .then(() => {
              // When receiving an offer lets answer it
              if (pc.remoteDescription.type === 'offer') {
                pc.createAnswer().then((desc  :RTCSessionDescriptionInit) =>vm.localDescCreated(desc)).catch(onError);
              }
            }, onError);
          } else if (msg.msgTipo === MsgTipo.CANDIDATE) {
            let inicio :RTCIceCandidateInit = msg.candidate as RTCIceCandidateInit;
            
            // Add the new ICE candidate to our connections remote description
            pc.addIceCandidate(
              new RTCIceCandidate(inicio))
              .then(() =>{}, onError
            );
          }
    }

     mediaUser(localVideo: any, pc: RTCPeerConnection) {
        navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        }).then(stream => {
            // Display your local video in #localVideo element
            localVideo.srcObject = stream;
            // Add your stream to be sent to the conneting peer
            stream.getTracks().forEach(track => pc.addTrack(track, stream));
        }, onError);
    }



}


/*


let keys: keyof Map<number>; // string
let value: Map<number>['foo']; // numb*/