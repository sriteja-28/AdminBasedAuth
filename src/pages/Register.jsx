// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { query, collection, where, getDocs } from "firebase/firestore"; 
import { 
  auth, 
  createUserWithEmailAndPassword, 
  db, 
  setDoc, 
  doc, 
  signOut,
  signInWithPopup 
} from "../utils/firebase";
import { Container, TextField, Button, Typography, Grid, Box, Avatar } from "@mui/material";
import ReCAPTCHA from "react-google-recaptcha";
import { generatePassword } from "../utils/validation";
import { googleProvider, facebookProvider, linkedinProvider } from "../utils/firebase";

export default function Register() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!captchaVerified) {
      alert("Please verify CAPTCHA.");
      return;
    }
  
    try {
      // Check if the email already exists in Firestore
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        alert("This account already exists. Please log in.");
        return;
      }
  
      // Generate a temporary password
      const tempPassword = generatePassword();
      const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword);
      const user = userCredential.user;
  
      await setDoc(doc(db, "users", user.uid), {
        name,
        dob,
        email,
        isActive: false, // waiting for admin approval
        authMethod: "email",
        tempPassword, // stored for admin reference/emailing later
      });
  
      alert("Registered successfully! Waiting for admin approval. You will receive an email with your login credentials soon.");
  
      // Sign out immediately so the user cannot access protected routes until activated.
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      alert(error.message);
    }
  };


  const handleOAuthSignIn = async (provider) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
  
      // Check if the email already exists in Firestore
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", user.email));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        alert("This account already exists. Please log in.");
        await signOut(auth);
        return;
      }
  
      await setDoc(
        doc(db, "users", user.uid),
        {
          name: user.displayName || "",
          email: user.email,
          dob: "",
          isActive: false,
          authMethod: provider.providerId,
        },
        { merge: true }
      );
  
      alert("Signed in successfully! Please wait for admin approval.");
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      alert(error.message);
    }
  };
  

  return (
    <Container
      maxWidth="xs"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mt: 4,
        p: 3,
        borderRadius: 3,
        boxShadow: 3,
        bgcolor: "white",
      }}
    >
      <Avatar sx={{ width: 80, height: 80, mb: 2 }} src="/logo.png" />
      <Typography variant="h4" gutterBottom>
        Register
      </Typography>
      <TextField
        fullWidth
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        margin="normal"
      />
      <TextField
        fullWidth
        type="date"
        label="Date of Birth"
        value={dob}
        onChange={(e) => setDob(e.target.value)}
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        fullWidth
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        margin="normal"
      />
      <Box my={2} width="100%" display="flex" justifyContent="center">
        <ReCAPTCHA
          sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
          onChange={() => setCaptchaVerified(true)}
        />
      </Box>
      <Button
        fullWidth
        variant="contained"
        color="primary"
        sx={{ mt: 2, borderRadius: "50px" }}
        onClick={handleRegister}
      >
        Register
      </Button>
      <Typography variant="body1" align="center" sx={{ mt: 2 }}>
        Or Sign Up with
      </Typography>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={4}>
          <Button
            variant="contained"
            color="error"
            fullWidth
            sx={{ borderRadius: "50px", fontSize: { xs: "0.7rem", sm: "0.8rem" } }}
            onClick={() => handleOAuthSignIn(googleProvider)}
          >
            Google
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ borderRadius: "50px", fontSize: { xs: "0.7rem", sm: "0.8rem" } }}
            onClick={() => handleOAuthSignIn(facebookProvider)}
          >
            Facebook
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            variant="contained"
            color="info"
            fullWidth
            sx={{ borderRadius: "50px", fontSize: { xs: "0.7rem", sm: "0.8rem" } }}
            onClick={() => handleOAuthSignIn(linkedinProvider)}
          >
            LinkedIn
          </Button>
        </Grid>
      </Grid>
      <Typography variant="body2" align="center" sx={{ mt: 2 }}>
        Already have an account?{" "}
        <Button
          onClick={() => navigate("/login")}
          sx={{ textTransform: "none", color: "blue" }}
        >
          Login here
        </Button>
      </Typography>
    </Container>
  );
}
