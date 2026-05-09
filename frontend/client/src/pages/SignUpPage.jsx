import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SignUpPage() {
    const [formData, setFormData] = useState({ username: '', password: '', email: '' });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        // Clear error for this field when user starts typing
        setErrors(prev => ({ ...prev, [e.target.name]: '' }));
        setServerError('');
    };

    const validateForm = () => {
        const newErrors = {};

        // Username validation
        if (!formData.username.trim()) {
            newErrors.username = 'Username is required';
        } else if (formData.username.length < 3 || formData.username.length > 50) {
            newErrors.username = 'Username must be between 3 and 50 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            newErrors.username = 'Username can only contain letters, numbers, and underscores';
        }

        // Email validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!/[a-zA-Z]/.test(formData.password) || !/\d/.test(formData.password)) {
            newErrors.password = 'Password must contain at least one letter and one number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        // send user data to login
        const xhttp = new XMLHttpRequest();
        const data = JSON.stringify(formData);
        const method = "POST";
        const url = "http://localhost:5000/register" // change this to actual backend ref

        xhttp.open(method, url, true);
        xhttp.setRequestHeader("Content-Type", "application/json")
        
        console.log(data)
        xhttp.send(data);

        xhttp.onload = function () {
            if (xhttp.status >= 200 && xhttp.status < 300) {
                console.log("User created, routing to Lobby");
                routeLobby();
            } else {
                // Parse error message from backend
                try {
                    const response = JSON.parse(xhttp.responseText);
                    const errorMsg = response.error || 'Sign up failed. Please try again.';

                    // Check for specific backend errors and map to field errors
                    if (errorMsg.toLowerCase().includes('username already exists')) {
                        setErrors(prev => ({ ...prev, username: 'This username is already taken' }));
                    } else if (errorMsg.toLowerCase().includes('email already registered')) {
                        setErrors(prev => ({ ...prev, email: 'This email is already registered' }));
                    } else {
                        setServerError(errorMsg);
                    }
                } catch {
                    setServerError('Sign up failed. Please try again.');
                }
            }
        };

        xhttp.onerror = function() {
            setServerError("Unable to connect to server. Please try again.")
        }

    }

    function routeLobby(){
        navigate("/lobby", {
            state: {nickname: formData.username}
        })
    }

    return (
        <div style={styles.container}>
            <h1>Jacobs Ladder</h1>

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

                {/* Email field */}
                <div style={styles.fieldContainer}>
                    <input
                        type="text"
                        name="email"
                        placeholder="Enter email"
                        onChange={handleChange}
                        style={{
                            ...styles.input,
                            border: errors.email ? '2px solid #e74c3c' : 'none'
                        }}
                    />
                    {errors.email && <span style={styles.errorText}>{errors.email}</span>}
                </div>

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
        marginTop: "20px",
        width: "300px"
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
    }

};

export default SignUpPage;