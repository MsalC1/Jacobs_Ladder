import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";


function LobbyPage() {
    const navigate = useNavigate();
    const location = useLocation();

    // const { nickname, token } = location.state || {};

    const storedToken = localStorage.getItem("token");
    const storedNickname = localStorage.getItem("nickname");

    const {
        nickname = storedNickname || "Guest",
        token = storedToken,
    } = location.state || {};

    const [roomCode, setRoomCode] = useState("");
    const [playerData, setPlayerData] = useState(null);


    function handleCreate() {


        const fallbackRoomCode = Math.random().toString(36).slice(2, 7).toUpperCase(); // just in case the player presses new room without adding room code
        
        const srvrRoom = roomCode.trim() ? roomCode.trim().toUpperCase() : fallbackRoomCode;

        navigate("/room", {
            state: {
                nickname: nickname || "Guest",
                roomCode: srvrRoom,
                token,
            },
        });

    }

    function handleJoin(e){
        e.preventDefault();

        const srvrRoom = roomCode.trim().toUpperCase();

        if (!roomCode.trim()) return;

        navigate("/room", {
            state: {
                nickname: nickname || "Guest",
                roomCode: srvrRoom,
                token,
            },
        });
    }

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("nickname");

        navigate("/");
    }

    useEffect(() => {
        if (!token) {
            console.error("No token found!");
            navigate("/");
            return;
        }

        const xhttp = new XMLHttpRequest();
        const method = "GET";
        const url = "http://localhost:5000/profile"

        xhttp.open(method, url, true);
        xhttp.setRequestHeader('Authorization', 'Bearer ' + token)
        
        xhttp.onreadystatechange = function() {

            if (xhttp.readyState === 4){
                if (xhttp.status === 200) {
                    const data = JSON.parse(xhttp.responseText)
                    setPlayerData(data)
                }
                else {
                    console.error("Data not fetched!")
                }
            }
            
        }

        xhttp.send();

    }, [token, navigate]);

    return (
        <div className="dynamic-bg" style={styles.page}>
            {/* <div className="dynamic-bg__marquee dynamic-bg__marquee--top">
                <div className="dynamic-bg__track">
                <span className="dynamic-bg__text">
                    JACOB'S LADDER&nbsp;&nbsp;JACOB'S LADDER&nbsp;&nbsp;JACOB'S LADDER&nbsp;&nbsp;
                </span>
                <span className="dynamic-bg__text" aria-hidden="true">
                    JACOB'S LADDER&nbsp;&nbsp;JACOB'S LADDER&nbsp;&nbsp;JACOB'S LADDER&nbsp;&nbsp;
                </span>
                </div>
            </div>

            <div className="dynamic-bg__marquee dynamic-bg__marquee--bottom">
                <div className="dynamic-bg__track dynamic-bg__track--reverse">
                <span className="dynamic-bg__text">
                    JACOB'S LADDER&nbsp;&nbsp;JACOB'S LADDER&nbsp;&nbsp;JACOB'S LADDER&nbsp;&nbsp;
                </span>
                <span className="dynamic-bg__text" aria-hidden="true">
                    JACOB'S LADDER&nbsp;&nbsp;JACOB'S LADDER&nbsp;&nbsp;JACOB'S LADDER&nbsp;&nbsp;
                </span>
                </div>
            </div> */}
        <div className="menu-card" style={styles.card}>
            <h1 style={{fontFamily: 'LadyRadical'}}>Lobby</h1>
            <p style={styles.playerName}>Player: {nickname || "Guest"}</p>
            <div style={styles.playerStats}>
                {playerData
                    ? `Games Played: ${playerData.games_played} | Games Won: ${playerData.wins}`
                    : "Loading..."}
            </div>

            <button onClick={handleCreate} style={styles.button}>
            Create Room
            </button>

            <form onSubmit={handleJoin} style={styles.form}>
            <input
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="Enter room code"
                style={styles.input}
            />

            <button type="submit" style={styles.button}>
                Join Room
            </button>
            </form>

            <button onClick={handleLogout} style={styles.buttonL}>Log Out</button>
        </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        // background: "#1a1a1a",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    card: {
        width: "320px",
        padding: "32px",
        borderRadius: "12px",
        background: "#2a2a2a",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        textAlign: "center",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },
    input: {
        padding: "12px",
        fontSize: "16px",
        borderRadius: "8px",
        border: "none",
    },
    button: {
        padding: "12px",
        fontSize: "16px",
        borderRadius: "8px",
        border: "none",
        background: "#4caf50",
        color: "white",
        cursor: "pointer",
    },
    buttonL: {
        padding: "12px",
        fontSize: "16px",
        borderRadius: "8px",
        border: "none",
        background: "#cb202c",
        color: "white",
        cursor: "pointer",
    },
    playerName: {
        fontFamily: "LadyRadical2",
        fontSize: "16px",
        margin: "0",
    },
    playerStats: {
        fontFamily: "Connection",
        fontSize: "16px",
        margin: "0",
        padding: "10px"
    },
};

export default LobbyPage;