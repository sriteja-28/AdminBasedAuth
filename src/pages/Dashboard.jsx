import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { auth, signOut, db } from "../utils/firebase";
import { doc, setDoc } from "firebase/firestore";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
} from "@mui/material";

export default function Dashboard() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  const isEmailAuth = user?.authMethod === "email";
  const isPass = user?.tempPassword;

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleChangePassword = async () => {
    try {
      if (newPassword.length < 8) {
        alert("Password must be at least 8 characters long");
        return;
      }

      if (!currentPassword) {
        alert("Please enter your current password");
        return;
      }

      const user = auth.currentUser;

      
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      
      await updatePassword(user, newPassword);

  
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, { tempPassword: newPassword }, { merge: true });

      
      setNewPassword("");
      setCurrentPassword("");
      alert("Password updated successfully");
      setOpen(false);
      
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Card sx={{ mt: 4 }}>
        <CardContent>
          {user?.photoUrl && (
            <Avatar
              src={user.photoUrl}
              alt={user?.name}
              sx={{ width: 80, height: 80, mb: 2, mx: "auto" }}
            />
          )}
          <Typography variant="h4" gutterBottom align="center">
            Welcome, {user?.name}
          </Typography>
          <Typography variant="body1" gutterBottom align="center">
            {user?.email}
          </Typography>
          <Typography variant="body1" gutterBottom align="center">
            Your access is activated.
          </Typography>
          {(isEmailAuth && isPass) && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpen(true)}
              sx={{ mr: 2 }}
            >
              Change Password
            </Button>
          )}
          <Button variant="contained" color="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Current Password"
            type="password"
            fullWidth
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
         
          <TextField
            margin="dense"
            label="New Password"
            type="password"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleChangePassword}>Submit</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
