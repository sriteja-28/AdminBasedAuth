import React from "react";
import { Card, CardContent, Typography, Container } from "@mui/material";


export const RegistrationSuccess = () => {
    return (
        <Container
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh"
            }}
        >
            <Card sx={{ width: "90%", maxWidth: 400, textAlign: "center", p: 3, boxShadow: 3 }}>
                <CardContent>
                    <Typography variant="h6" color="green">
                        Registered successfully! Waiting for admin approval.
                        You will receive an email with your login credentials soon.
                    </Typography>
                </CardContent>
            </Card>
        </Container>
    );
};



export const PendingApproval = () => {
    return (
        <Container
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh"
            }}
        >
            <Card sx={{ width: "90%", maxWidth: 400, textAlign: "center", p: 3, boxShadow: 3 }}>
                <CardContent>
                    <Typography variant="h6" color="error">
                        Your account is not activated. Please wait for admin approval...!
                    </Typography>
                </CardContent>
            </Card>
        </Container>
    );
};

