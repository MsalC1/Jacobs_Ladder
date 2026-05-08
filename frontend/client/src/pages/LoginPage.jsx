import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
    const [formData, setFormData] = useState({username: '', password: ''});
    const navigate = useNavigate();


    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        // send user data to login
        const xhttp = new XMLHttpRequest();
        const method = "POST";
        const data = JSON.stringify(formData)
        const url = "http://localhost:5000/login" // change this to actual backend ref


        xhttp.open(method, url, true);
        xhttp.setRequestHeader("Content-Type", "application/json")

        xhttp.send(data);

        xhttp.onload = function() {
            // safegaurds for other error types
            if (xhttp.status >= 200 && xhttp.status < 300){
                console.log("User Logged in with token: ", this.responseText);
                routeLobby();
            } else {
                console.error("Server Error: ", xhttp.status, xhttp.responseText);
            }

            
        }
        xhttp.onerror = function() {
            alert("Error: User not able to Log In")
        }

    }

    function routeLobby(){
        navigate("/lobby", {
            state: {nickname: formData.username}
        })
    }

    function routeSignUp (){
        
        navigate("/signup")

    }

    return (
        <div style={styles.container}>
            <h1>Jacobs Ladder</h1>

            <form onSubmit={handleSubmit} style={styles.form}>
                <input
                type="text"
                name="username"
                placeholder="Enter username"
                onChange={handleChange}
                style={styles.input}
                />

                <input
                type="text"
                name="password"
                placeholder="Enter password"
                onChange={handleChange}
                style={styles.input}
                />

                <button type="submit" style={styles.button}>Log In</button>
            </form>
             <button type="submit" style={styles.signUpButton} onClick={routeSignUp}>New to Jacobs Ladder? Sign Up!</button>
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
        cursor: "pointer",
    }, 
    signUpButton: {
        padding: "10px",
        fontSize: "16px",
        borderRadius: "6px",
        border: "none",
        background: "#634caf",
        color: "white",
        cursor: "pointer",
        marginTop: "20px"

    }

};

export default LoginPage;