export default class P2PManager {
    constructor(socket, roomID, nickname) {

       this.peerConnection = new RTCPeerConnection({
        iceServers: [{urls: 'stun:stun.l.google.com:19302'}]
       });
       
       this.socket = socket;

       this.roomID = roomID;

       this.nickname = nickname;

       this.targetSID = null;

       this.dataChannel = null

    }

    async joinRoom() {
        // players are required to be in a room
        this.socket.emit('join_room', {room: this.roomID, username: this.nickname})

        // listen for signals from the room
        this.setUpListeners();

    }


    setUpListeners() {


        // get ice candidates and respond to them
        this.peerConnection.onicecandidate = (event) => {
            if(event.candidate && this.targetSID) {
                this.socket.emit('signal', {to: this.targetSID, data: {type: 'candidate', payload: event.candidate}}) // check if this is correct?
            }
        };


        // SIGNALING SERVER FUNCTIONS

        // on signal
        this.socket.on('signal', async (msg) => {
            this.targetSID = msg.from;

            const {type, payload} = msg.data

            // listen for offer type signals
            if (type === 'offer'){
                await this.peerConnection.setRemoteDescription( new RTCSessionDescription(payload));
                const answer = await this.peerConnection.createAnswer();
                await this.peerConnection.setLocalDescription(answer);

                this.socket.emit('signal', {
                    to: this.targetSID,
                    data: {type: 'answer', payload: answer}
                });
            }

            // listen for answer type signals
            if (type === 'answer'){
                await this.peerConnection.setRemoteDescription( new RTCSessionDescription(payload) )
            }

            // listen for candidates type signals
            if (type === 'candidate'){
                try {
                    await this.peerConnection.addIceCandidate( new RTCIceCandidate(payload));
                } catch (e) {
                    console.error("Error adding ICE candidate:", e);
                }
            }



        });

        // on peer

        // on new_peer
        this.socket.on('new_peer', async (msg) => {
            console.log("New Peer in a room", msg.nickname);

            try {
                this.targetSID = msg.sid;
                await this.startCall();
            } catch (e) {
                console.log("Failed to start webRTC call:", e);
            }

        })

        // on nickname_assigned

        // on ready

        // on peer_left

        // establish p2p message
        this.peerConnection.ondatachannel = (event) => {
            const recieveChannel = event.channel;
            recieveChannel.onmessage = (e) => {
                console.log("P2P Connection Message:", e.data);
                // do things with remoteplayer here!!!
            };
        };
    }

    // start the webRTC back and forth
    // ONLY USE WHEN >2 PLAYERS IN A ROOM!!!
    async startCall() {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        this.socket.emit('signal', {
            to: this.targetSID,
            data: {type: 'offer', payload: offer}
        })
    }




}