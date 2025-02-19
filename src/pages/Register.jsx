import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs, setDoc, doc } from "firebase/firestore";
import { auth, createUserWithEmailAndPassword, db, signOut, signInWithPopup, storage } from "../utils/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Container, TextField, Button, Typography, Grid, Box, Avatar } from "@mui/material";
import ReCAPTCHA from "react-google-recaptcha";
import { generatePassword } from "../utils/validation";
import { googleProvider, facebookProvider, microsoftProvider, githubProvider } from "../utils/firebase";

export default function Register() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageName, setProfileImageName] = useState("");
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const navigate = useNavigate();


  const handleRegister = async () => {
    // !Enable for production
    // if (!captchaVerified) {
    //   alert("Please verify CAPTCHA");
    //   return;
    // }
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        alert("This email is already registered. Please log in.");
        return;
      }

      const tempPassword = generatePassword();
      const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword);
      const user = userCredential.user;

      let photoUrl = "";
      if (profileImage) {
        const storageRef = ref(storage, `profileImages/${user.uid}`);
        await uploadBytes(storageRef, profileImage);
        photoUrl = await getDownloadURL(storageRef);
      }

      await setDoc(
        doc(db, "users", user.uid),
        {
          name: name || "",
          dob: dob || "",
          email: user.email,
          photoUrl,
          isActive: false,
          authMethod: "email",
          tempPassword,
        },
        { merge: true }
      );

      alert("Registered successfully! Waiting for admin approval.");
      await signOut(auth);
      navigate("/regSucess");
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
        alert("This email is already registered. Please use the existing account.");
        await signOut(auth);
        return;
      }

      await setDoc(
        doc(db, "users", user.uid),
        {
          name: user.displayName || "",
          email: user.email,
          dob: "",
          photoUrl: user.photoURL || "",
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
      console.log(error.message);
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


{/* //!when storage upgraded we can use this */}
      {/* <Button
        variant="contained"
        component="label"
        sx={{ mt: 2 }}
      >
        Upload Profile Image
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              setProfileImage(file);
              setProfileImageName(file.name); // Set file name
            }
          }}
        />
      </Button>

      {profileImageName && (
        <Typography variant="body2" sx={{ mt: 1, color: "gray" }}>
          Selected: {profileImageName}
        </Typography>
      )} */}

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
        <Grid item xs={6}>
          <Button
            variant="contained"
            fullWidth
            sx={{
              borderRadius: "50px",
              backgroundColor: "#DB4437",
              "&:hover": { backgroundColor: "#C1351D" },
            }}
            onClick={() => handleOAuthSignIn(googleProvider)}
          >
            Google
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            variant="contained"
            fullWidth
            sx={{
              borderRadius: "50px",
              backgroundColor: "#1877F2",
              "&:hover": { backgroundColor: "#166FE5" },
            }}
            onClick={() => handleOAuthSignIn(facebookProvider)}
          >
            Facebook
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            variant="contained"
            fullWidth
            sx={{
              borderRadius: "50px",
              backgroundColor: "#333",
              "&:hover": { backgroundColor: "#444" },
            }}
            onClick={() => handleOAuthSignIn(githubProvider)}
          >
            GitHub
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button
            variant="contained"
            fullWidth
            sx={{
              borderRadius: "50px",
              backgroundColor: "#673AB7",
              "&:hover": { backgroundColor: "#5E35B1" },
            }}
            onClick={() => handleOAuthSignIn(microsoftProvider)}
          >
            Microsoft
          </Button>
        </Grid>
      </Grid>
      <Typography variant="body2" align="center" sx={{ mt: 2 }}>
        Already have an account ?{" "}
        <Button onClick={() => navigate("/login")} sx={{ textTransform: "none", color: "blue" }}>
          Login here
        </Button>
      </Typography>
    </Container>
  );
}
