import { Injectable } from '@angular/core';
import {MessageRtc, MsgTipo} from '../../../../imports/models/message'
import $ from "jquery";
/*interface Map<T> {
    [key: string]: T;
}
*/

interface Rtc {
    localDes : string,
    remotDes : string,
    pc : RTCPeerConnection,
    idClase : string,
    singalSender : Function,
    singalGetter : Function,
    localVideoId : string,
    remoteVideoId : string,
}

function onError(error) {
    console.error(error);
  }

@Injectable({
  // we declare that this service should be created
  // by the root application injector.
  providedIn: 'root',
})
export class RtcService {

    //roles : Map<Rol>

    configuration :object = {
        iceServers: [{
          urls: 'stun:stun.l.google.com:19302'
        }]
    }
    

    rct :  Rtc

    contructor()
    {
        
      

        
    }
    newMsg(idClase :string, tipo:MsgTipo, sdp ?: RTCSessionDescription, candidate ?: RTCIceCandidate) : MessageRtc
    {
        return   {
            idClase : idClase,
            msgTipo : tipo,
            sdp : sdp,
            candidate : candidate
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
            vm.sendMessage(vm.newMsg(vm.rct.idClase, MsgTipo.SDP, vm.rct.pc.localDescription));

        };
       
        this.rct.pc.setLocalDescription(desc)
        .then(onSuccess,
        onError)

      }


      startWebRTC() {

        let vm =this;
        let pc = this.rct.pc;
        
        let remoteVideo = $("#" + vm.rct.remoteVideoId),  localVideo = $("#" + vm.rct.localVideoId)
        pc = new RTCPeerConnection(this.configuration);
      
        // 'onicecandidate' notifies us whenever an ICE agent needs to deliver a
        // message to the other peer through the signaling server
        
        pc.onicecandidate = event => {
          if (event.candidate) {
            vm.sendMessage(vm.newMsg(vm.rct.idClase, MsgTipo.CANDIDATE, null,event.candidate));
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
      
        vm.rct.singalGetter = (msg : MessageRtc) => vm.getMsg(msg);
      
       
      }



    getMsg(msg : MessageRtc)
    {

        let vm=this;
        let pc = vm.rct.pc;
        if (msg.msgTipo === MsgTipo.SDP) {
            // This is called after receiving an offer or answer from another peer

            vm.rct.pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
            .then(() => {
              // When receiving an offer lets answer it
              if (pc.remoteDescription.type === 'offer') {
                pc.createAnswer().then((desc  :RTCSessionDescriptionInit) =>vm.localDescCreated(desc)).catch(onError);
              }
            }, onError);
          } else if (msg.msgTipo === MsgTipo.CANDIDATE) {
            // Add the new ICE candidate to our connections remote description
            pc.addIceCandidate(
              new RTCIceCandidate(msg.candidate))
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