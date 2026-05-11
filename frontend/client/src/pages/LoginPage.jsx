import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
    const [formData, setFormData] = useState({username: '', password: ''});
    const [errors, setErrors] = useState({}); 
    const [serverError, setServerError] = useState('');
    const navigate = useNavigate();


    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value })
        // Clear error for this field when user starts typing
        setErrors(prev => ({ ...prev, [e.target.name]: '' }));
        setServerError('');
    }

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // send user data to login
        const xhttp = new XMLHttpRequest();
        const method = "POST";
        const data = JSON.stringify(formData)
        // const url = "http://localhost:5000/login"
        const url = "https://game-backend-cagb.onrender.com/login"


        xhttp.open(method, url, true);
        xhttp.setRequestHeader("Content-Type", "application/json")

        xhttp.send(data);

        xhttp.onload = function() {
            if (xhttp.status >= 200 && xhttp.status < 300) {
                console.log("User Logged in with token: ", this.responseText);

                const data = JSON.parse(this.responseText);
                const genToken = data.token;

                // Save login info to local storage so Lobby/Game can recover it after navigation or refresh
                localStorage.setItem("token", genToken);
                localStorage.setItem("nickname", formData.username);

                routeLobby(genToken);
            } else {
                // Parse error message from backend
                try {
                    const response = JSON.parse(xhttp.responseText);
                    setServerError(response.error || 'Invalid username or password');
                } catch {
                    setServerError('Invalid username or password');
                }
            }            
        };

        xhttp.onerror = function() {
            setServerError('Unable to connect with server. Please try again.')
        }
    };

    function routeLobby(token){
        navigate("/lobby", {
            state: {nickname: formData.username, token: token}
        })
    }

    function routeSignUp (){
        
        navigate("/signup")

    }

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
            <h1 style={styles.title}>Jacobs Ladder</h1>

            <form onSubmit={handleSubmit} style={styles.form}>

                {/* Server error message */}
                {serverError && (
                    <div style={styles.serverError}>{serverError}</div>
                )}

                {/* Username field */}
                <div style={styles.fieldContainer}>
                    <input
                        type="text"
                        name="username"
                        placeholder="Enter username"
                        onChange={handleChange}
                        style={{
                            ...styles.input,
                            border: errors.username ? '2px solid #e74c3c' : 'none'
                        }}
                    />
                    {errors.username && <span style={styles.errorText}>{errors.username}</span>}
                </div>

                {/* Password field */}
                <div style={styles.fieldContainer}>
                    <input
                        type="password"
                        name="password"
                        placeholder="Enter password"
                        onChange={handleChange}
                        style={{
                            ...styles.input,
                            border: errors.password ? '2px solid #e74c3c' : 'none'
                        }}
                    />
                    {errors.password && <span style={styles.errorText}>{errors.password}</span>}
                </div>

                <button type="submit" style={styles.button}>Log In</button>
            </form>

            <button type="button" style={styles.signUpButton} onClick={routeSignUp}>
                New to Jacobs Ladder? Sign Up!
            </button>
        </div>
        </div>
    );
}

const styles = {
    // container: {
    //     height: "100vh",
    //     display: "flex",
    //     flexDirection: "column",
    //     justifyContent: "center",
    //     alignItems: "center",
    //     background: "#1a1a1a",
    //     color: "#fff"
    // },
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
        marginTop: "20px"
    },
    fieldContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "4px"
    },
    input: {
        padding: "10px",
        fontSize: "16px",
        borderRadius: "6px",
        border: "none"
    },
    errorText: {
        color: "#e74c3c",
        fontSize: "13px",
        marginTop: "2px"
    },
    serverError: {
        background: "#e74c3c22",
        border: "1px solid #e74c3c",
        color: "#e74c3c",
        padding: "10px",
        borderRadius: "6px",
        fontSize: "14px",
        textAlign: "center"
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

    },
    title: {
        fontFamily: "LadyRadical",
        letterSpacing: "1px",
    },

};

export default LoginPage;