import React, { useEffect, useState } from "react";
import { db, collection, getDocs, updateDoc, doc } from "../utils/firebase";
import emailjs from "emailjs-com";
import { auth, signOut } from "../utils/firebase";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@mui/material";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);
    };

    fetchUsers();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleToggleActivation = async (user) => {
    const newStatus = !user.isActive;
    await updateDoc(doc(db, "users", user.id), { isActive: newStatus });
    setUsers((prevUsers) =>
      prevUsers.map((u) => (u.id === user.id ? { ...u, isActive: newStatus } : u))
    );

    if (newStatus) {
      // Prepare template parameters for EmailJS
      const templateParams = {
        to_name: user.name || "User",
        to_email: user.email,
        subject: "Your Account Has Been Activated",
        message: `Your account has been activated successfully. Your login password is: ${user.tempPassword}`,
        email: "Admin Team",
      };

      emailjs
        .send(
        //Ids to send messages
        // import.meta.env.VITE_EMAILJS_SERVICE_ID,
        // import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        // templateParams,
        // import.meta.env.VITE_EMAILJS_USER_ID
      )
        .then(
          (response) => {
            console.log("Email sent successfully!", response.status, response.text);
          },
          (error) => {
            console.error("Failed to send email:", error);
          }
        );
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Panel - Manage Users
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleLogout}
        sx={{ marginBottom: "5px",float:"right"}}
      >
        Logout
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Auth Method</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name || "N/A"}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.authMethod || "N/A"}</TableCell>
                <TableCell>{user.isActive ? "Active" : "Inactive"}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color={user.isActive ? "error" : "success"}
                    onClick={() => handleToggleActivation(user)}
                  >
                    {user.isActive ? "Deactivate" : "Activate"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
