import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
    const [nickname, setNickname] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    function handleSubmit(e) {
        // we need to do HTTP methods here!
        
        e.preventDefault();

        if (!nickname.trim()) return;

        navigate("/lobby", {
            state: { nickname }
        });
    }

    return (
        <div style={styles.container}>
            <h1>Jacobs Ladder</h1>

            <form onSubmit={handleSubmit} style={styles.form}>
                <input
                type="text"
                placeholder="Enter username"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                style={styles.input}
                />

                <input
                type="text"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                />

                <button type="submit" style={styles.button}>Log In</button>
                <button type="submit" style={styles.button}>Sign Up</button>
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