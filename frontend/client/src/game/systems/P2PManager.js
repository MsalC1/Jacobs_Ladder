export default class P2PManager {
    constructor(socket, roomID, nickname) {

       this.peerConnection = new RTCPeerConnection({
        iceServers: [{urls: 'stun:stun.l.google.com:19302'}]
       });
       
       this.socket = socket;

       this.roomID = roomID;

       this.nickname = nickname;
       
       this.onPlayerState = null;

       this.onPush = null;

       this.targetSID = null;

       this.dataChannel = null;

       this.peerJoined = null;

       this.onPeerLeft = null;

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
            console.log("peer ICE candidate");
            if(event.candidate && this.targetSID) {
                this.socket.emit('signal', {to: this.targetSID, data: {type: 'candidate', payload: event.candidate}}) // check if this is correct?
            }
        };

        // FOR DEBUG
        this.peerConnection.oniceconnectionstatechange = () => {
            console.log("ICE State: ", this.peerConnection.iceConnectionState);
        }

        // When user leaves room (ts not working):
        this.socket.on("peer_left", (msg) => {
            console.log("Peer left Test:",msg);

            const sid = (typeof msg === "string") ? msg : msg.sid;

            this.onPeerLeft?.(sid);
            this.peerLeft?.(sid);
        });


        // SIGNALING SERVER FUNCTIONS

        // on signal
        this.socket.on('signal', async (msg) => {
            this.targetSID = msg.from;

            const {type, payload} = msg.data

            // listen for offer type signals
            if (type === 'offer'){

                console.log("viewing offer");
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
                console.log("viewing answer")
                await this.peerConnection.setRemoteDescription( new RTCSessionDescription(payload) )
            }

            // listen for candidates type signals
            if (type === 'candidate'){
                console.log("viewing candidate");
                try {
                    await this.peerConnection.addIceCandidate( new RTCIceCandidate(payload));
                } catch (e) {
                    console.error("Error adding ICE candidate:", e);
                }
            }



        });

        // on peers
        this.socket.on('peers', async (msg) => {
            console.log("sending peers names to all clients") //debug
            console.log(msg);


            const playersInRoom = Array.isArray(msg) ? msg : Array.isArray(msg.players_in_room) ? msg.players_in_room : []; // if player list is empty assign an empty array

            this.peerJoined?.(playersInRoom);
        })


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
            this.dataChannel = event.channel;

            this.dataChannel.onopen = () => {
                console.log("Recieve data channel open");
            };

            this.dataChannel.onmessage = (e) => {
                this.handleDataMessage(e.data);
            }
        };
    }

    handleDataMessage(rawData) {
        const message = JSON.parse(rawData);

        if (message.type === "player-state") {
            this.onPlayerState?.(message.playerId, message.state);
        }

        if (message.type === "push") {
            this.onPush?.(message);
        }
    }

    sendPlayerState(state) {
        if (!this.dataChannel) return;
        if (this.dataChannel.readyState !== "open") return;

        this.dataChannel.send(JSON.stringify({
            type: "player-state",
            playerId: this.socket.id,
            nickname: this.nickname,
            state,
        }));
    }

    sendPush(pushData) {
        if (!this.dataChannel) return;
        if (this.dataChannel.readyState !== "open") return;

        this.dataChannel.send(JSON.stringify({
            type: "push",
            fromPlayerId: this.socket.id,
            targetPlayerId: pushData.targetPlayerId,
            direction: pushData.direction,
            forceX: pushData.forceX,
            forceY: pushData.forceY,
        }));
    }

    leaveRoom() {
        this.socket.emit("leave_room", { room: this.roomID });

        if (this.dataChannel) {
            this.dataChannel.close();
        }

        if (this.peerConnection) {
            this.peerConnection.close();
        }
    }

    // start the webRTC back and forth
    // ONLY USE WHEN >2 PLAYERS IN A ROOM!!!
    async startCall() {
        console.log("starting call")
        this.dataChannel = this.peerConnection.createDataChannel("game-state");
        this.dataChannel.onopen = () => {
            console.log("Data channel open");  
        };

        this.dataChannel.onmessage = (e) => {
            this.handleDataMessage(e.data);
        };

        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);

        this.socket.emit('signal', {
            to: this.targetSID,
            data: { type: 'offer', payload: offer }
        })
    }
}