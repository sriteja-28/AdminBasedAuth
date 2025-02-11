import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Facebook, Google, LinkedIn } from "@mui/icons-material";
import {
  auth,
  db,
  signInWithEmailAndPassword,
  signInWithPopup,
  googleProvider,
  facebookProvider,
  linkedinProvider,
  doc,
  getDoc,
  setDoc,
  signOut,
  sendPasswordResetEmail
} from "../utils/firebase";
import {
  Container,
  TextField,
  Button,
  Typography,
  Grid,
  Box,
  Avatar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from "@mui/material";
import ReCAPTCHA from "react-google-recaptcha";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [openForgotPassword, setOpenForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const navigate = useNavigate();

  
  const handleLogin = async () => {

    //!enable when u need
    if (!captchaVerified) {
      alert("Please verify CAPTCHA");
      return;
    }
    try {
      console.log("Attempting login...");
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      console.log("User logged in:", firebaseUser);
  
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        console.error("User document does not exist.");
        alert("No user record found. Contact support.");
        return;
      }
  
      const userData = userDoc.data();
      console.log("User data from Firestore:", userData);
  
      if (!userData.isActive) {
        alert("Your account is not activated. Please wait for admin approval.");
        return;
      }
  
      navigate(firebaseUser.email.toLowerCase() === adminEmail.toLowerCase() ? "/admin" : "/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      alert(`Error: ${error.message}`);
    }
  };
  
  const handleSocialLogin = async (provider) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
  

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
  
      if (userSnap.exists()) {
        const userData = userSnap.data();
  
        if (userData.isActive) {
          navigate("/dashboard");
        } else {
          alert("Your account is not activated. Please wait for admin approval.");
          await signOut(auth);
        }
      } else {
        alert("User record not found. Contact support.");
        await signOut(auth);
      }
    } catch (error) {
      console.error("Social login error:", error);
      if (error.code === "auth/popup-blocked") {
        await signInWithRedirect(auth, provider);
      } else {
        alert(`Error: ${error.message}`);
      }
    }
  };
  

  
  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      alert("Please enter your email.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, forgotEmail);
      alert("Password reset email sent! Check your inbox.");
      setOpenForgotPassword(false); 
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
        Login
      </Typography>
      <TextField
        fullWidth
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        margin="normal"
      />
      <TextField
        fullWidth
        type="password"
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
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
        onClick={handleLogin}
      >
        Login
      </Button>
      <Typography variant="body1" align="center" sx={{ mt: 2 }}>
        Forgot password?{" "}
        <Button onClick={() => setOpenForgotPassword(true)} sx={{ textTransform: "none", color: "blue" }}>
          Click here to reset
        </Button>
      </Typography>
      <Typography variant="body1" align="center" sx={{ mt: 2 }}>
        Or Sign In with
      </Typography>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={4}>
          <Button
            variant="contained"
            color="error"
            fullWidth
            sx={{
              borderRadius: "50px",
              fontSize: { xs: "0.7rem", sm: "0.8rem" },
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
            onClick={() =>  handleSocialLogin(googleProvider)}
          >
            <Google sx={{ fontSize: "1.2rem" }} />
            Google
          </Button>


        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              borderRadius: "50px",
              fontSize: { xs: "0.7rem", sm: "0.8rem" },
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
            onClick={() =>  handleSocialLogin(facebookProvider)}
          >
            <Facebook sx={{ fontSize: "1.2rem" }} />
            Facebook
          </Button>

        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            variant="contained"
            color="info"
            fullWidth
            sx={{
              borderRadius: "50px",
              fontSize: { xs: "0.7rem", sm: "0.8rem" },
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
            onClick={() =>  handleSocialLogin(linkedinProvider)}
          >
            <LinkedIn sx={{ fontSize: "1.2rem" }} />
            LinkedIn
          </Button>



        </Grid>
      </Grid>
      <Typography variant="body2" align="center" sx={{ mt: 2 }}>
        Don't have an account?{" "}
        <Button
          onClick={() => navigate("/register")}
          sx={{ textTransform: "none", color: "blue" }}
        >
          Register here
        </Button>
      </Typography>

     
      <Dialog open={openForgotPassword} onClose={() => setOpenForgotPassword(false)}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Enter your email"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForgotPassword(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleForgotPassword} color="primary" variant="contained">
            Reset Password
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
