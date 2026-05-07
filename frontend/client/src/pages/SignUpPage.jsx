import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SignUpPage() {
    const [formData, setFormData] = useState({username: '', password: '', email: ''});
    const navigate = useNavigate();


    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value })
    }


    const handleSubmit = async (e) => {
        e.preventDefault();

        // send user data to login
        const xhttp = new XMLHttpRequest();
        const data = JSON.stringify(formData);
        const method = "POST";
        const url = "http://localhost:5000/register" // change this to actual backend ref

        xhttp.open(method, url, true);
        xhttp.setRequestHeader("Content-Type", "application/json")
        
        console.log(data)
        xhttp.send(data);

        xhttp.onload = function() {
            console.log("User succesfully created in");
        }
        xhttp.onerror = function() {
            alert("Error: User not able to sign up")
        }

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

                <input
                type="text"
                name="email"
                placeholder="Enter email"
                onChange={handleChange}
                style={styles.input}
                />

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
        cursor: "pointer",
    }

};

export default SignUpPage;