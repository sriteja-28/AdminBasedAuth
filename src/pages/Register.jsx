import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Facebook, GitHub, Google, LinkedIn, Microsoft } from "@mui/icons-material";
import { query, collection, where, getDocs } from "firebase/firestore";
import { grey, deepPurple } from "@mui/material/colors";



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
import { googleProvider, facebookProvider, microsoftProvider, githubProvider } from "../utils/firebase";

export default function Register() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      //! Enable this when needed
      // if (!captchaVerified) {
      //   alert("Please verify CAPTCHA.");
      //   return;
      // }


      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const existingUser = querySnapshot.docs[0].data();
        alert(
          existingUser.authMethod === "email"
            ? "This email is already registered. Please log in."
            : `This email is already registered using ${existingUser.authMethod}. Please use that method to log in.`
        );
        return;
      }


      const tempPassword = generatePassword();


      const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword);
      const user = userCredential.user;


      await setDoc(
        doc(db, "users", user.uid),
        {
          name: name || "",
          dob: dob || "",
          email: user.email,
          isActive: false,
          authMethod: "email",
          tempPassword,
        },
        { merge: true }
      );


      alert(
        "Registered successfully! Waiting for admin approval. You will receive an email with your login credentials soon."
      );

      await signOut(auth);
      navigate("/regSucess");
      // navigate("/login");
    } catch (error) {
      console.error("Registration Error:", error);
      alert(`${error.message} : Please try using other options`);
    }

  };


const handleOAuthSignIn = async (provider) => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const providerId = provider.providerId || result.providerId || result.credential?.providerId;

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", user.email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const existingUser = querySnapshot.docs[0].data();
      if (existingUser.authMethod !== providerId) {
        alert(`This email is already registered using ${existingUser.authMethod}. Please use that method to log in.`);
        await signOut(auth);
        return;
      } else {
        alert("This email is already registered. Please use another account.");
        await signOut(auth);
        return;
      }
    }

    await setDoc(
      doc(db, "users", user.uid),
      {
        name: user.displayName || "",
        email: user.email,
        dob: "",
        isActive: false,
        authMethod: providerId,
      },
      { merge: true }
    );

    alert("Signed in successfully! Please wait for admin approval.");
    await signOut(auth);
    navigate("/regSucess");
  } catch (error) {
    console.error("Registration Error:", error);
    alert(`${error.message} : Please try using other options`);
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
        <Grid item xs={6} sm={6} md={6}>
          <Button
            variant="contained"
            fullWidth
            sx={{
              borderRadius: "50px",
              backgroundColor: "#DB4437",
              "&:hover": { backgroundColor: "#C1351D" },
              fontSize: { xs: "0.6rem", sm: "0.8rem", md: "1rem" },
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
            onClick={() => handleOAuthSignIn(googleProvider)}
          >
            <Google sx={{ fontSize: "1.2rem" }} />
            Google
          </Button>
        </Grid>

        <Grid item xs={6} sm={6} md={6}>
          <Button
            variant="contained"
            fullWidth
            sx={{
              borderRadius: "50px",
              backgroundColor: "#1877F2",
              "&:hover": { backgroundColor: "#166FE5" },
              fontSize: { xs: "0.6rem", sm: "0.8rem", md: "1rem" },
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
            onClick={() => handleOAuthSignIn(facebookProvider)}
          >
            <Facebook sx={{ fontSize: "1.2rem" }} />
            Facebook
          </Button>
        </Grid>

        <Grid item xs={6} sm={6} md={6}>
          <Button
            variant="contained"
            fullWidth
            sx={{
              borderRadius: "50px",
              backgroundColor: grey[900],
              "&:hover": { backgroundColor: grey[800] },
              fontSize: { xs: "0.6rem", sm: "0.8rem", md: "1rem" },
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
            onClick={() => handleOAuthSignIn(githubProvider)}
          >
            <GitHub sx={{ fontSize: "1.2rem" }} />
            GitHub
          </Button>
        </Grid>

        <Grid item xs={6} sm={6} md={6}>
          <Button
            variant="contained"
            fullWidth
            sx={{
              borderRadius: "50px",
              backgroundColor: deepPurple[500],
              "&:hover": { backgroundColor: deepPurple[700] },
              fontSize: { xs: "0.6rem", sm: "0.8rem", md: "1rem" },
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
            onClick={() => handleOAuthSignIn(microsoftProvider)}
          >
            <Microsoft sx={{ fontSize: "1.2rem" }} />
            Microsoft
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
