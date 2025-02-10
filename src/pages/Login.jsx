import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    if (!captchaVerified) {
      alert("Please verify CAPTCHA");
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Fetch user data from Firestore
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (!userDoc.exists() || !userDoc.data().isActive) {
        alert("Your account is not activated. Please wait for admin approval.");
        await signOut(auth);
        return;
      }
  
      // Check if the user is admin
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
      if (firebaseUser.email.toLowerCase() === adminEmail.toLowerCase()) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      alert(error.message);
    }
  };
  

  // Function to handle password reset
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
            sx={{ borderRadius: "50px", fontSize: { xs: "0.7rem", sm: "0.8rem" } }}
            onClick={() => signInWithPopup(auth, googleProvider)}
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
            onClick={() => signInWithPopup(auth, facebookProvider)}
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
            onClick={() => signInWithPopup(auth, linkedinProvider)}
          >
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

      {/* Forgot Password Dialog */}
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
