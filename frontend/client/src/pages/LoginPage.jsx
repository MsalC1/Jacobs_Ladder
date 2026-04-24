import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
    const [nickname, setNickname] = useState("");
    const navigate = useNavigate();

    function handleSubmit(e) {
        e.preventDefault();

        if (!nickname.trim()) return;

        navigate("/lobby", {
            state: { nickname }
        });
    }

    return (
        <div style={styles.container}>
            <h1>Welcome</h1>

            <form onSubmit={handleSubmit} style={styles.form}>
                <input
                type="text"
                placeholder="Enter nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                style={styles.input}
                />

                <button type="submit" style={styles.button}>Enter Lobby</button>
            </form>
        </div>
    );
}

const styles = {
    container: {
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#1a1a1a",
        color: "#fff"
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        marginTop: "20px"
    },
    input: {
        padding: "10px",
        fontSize: "16px",
        borderRadius: "6px",
        border: "none"
    },
    button: {
        padding: "10px",
        fontSize: "16px",
        borderRadius: "6px",
        border: "none",
        background: "#4CAF50",
        color: "white",
        cursor: "pointer"
    }
};

export default LoginPage;