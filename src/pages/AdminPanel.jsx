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
import { generatePassword } from "../utils/validation";

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
    
    let tempPassword = user.tempPassword;
    if (newStatus && !tempPassword) {
      tempPassword = generatePassword(); 
    }

    const updateData = { isActive: newStatus };
    if (!user.tempPassword && newStatus) {
      updateData.tempPassword = tempPassword; 
    }

    await updateDoc(doc(db, "users", user.id), updateData);

    setUsers((prevUsers) =>
      prevUsers.map((u) =>
        u.id === user.id ? { ...u, isActive: newStatus, tempPassword } : u
      )
    );

    console.log(`User ${user.email} status changed to: ${newStatus ? "Active" : "Inactive"}`);

    const templateParams = {
      to_name: user.name || "User",
      to_email: user.email,
      subject: newStatus ? "Your Account Has Been Activated" : "Your Account Has Been Deactivated",
      message: newStatus
        ? `Your account has been activated successfully. Your login password is: ${tempPassword}`
        : `Your account has been deactivated. Please contact support for assistance.`,
      email: "Admin Team",
    };

    if (newStatus || !user.isActive) {
      console.log(`Sending email to ${user.email}...`);

      emailjs
        .send(
          // !enable for production
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
        sx={{ marginBottom: "5px", float: "right" }}
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
