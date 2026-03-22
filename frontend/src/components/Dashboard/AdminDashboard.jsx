import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Box, Card, CardContent, Typography, Grid, IconButton, Button } from "@mui/material";
 
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupIcon from "@mui/icons-material/Group";
import SecurityIcon from "@mui/icons-material/Security";
import { styled } from "@mui/material/styles";
import UserManagement from "../Client/UserManagement"; // Asegúrate de tener este componente creado
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ProjectsPage from "../Project/pages/ProjectsPage";
import { ProjectContext, ProjectProvider } from "../../context/ProjectContext";
// Import TaskList component
import TaskList from "../TaskTable/TaskList";
import TaskManagement from "../TaskManagement/TaskManagement";
const DashboardContainer = styled("div")(({ theme }) => ({
  padding: "40px",
  background: "linear-gradient(135deg, #f4f6f8 0%, #e9ecef 100%)",
  minHeight: "100vh",
  textAlign: "center",
}));

const DashboardTitle = styled(Typography)(({ theme }) => ({
  fontSize: "36px",
  fontWeight: "800",
  color: "#592d2d",
  marginBottom: "30px",
  position: "relative",
  "&:after": {
    content: '""',
    position: "absolute",
    bottom: "-10px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "60px",
    height: "4px",
    background: "linear-gradient(90deg, #1a237e 0%, #3949ab 100%)",
    borderRadius: "2px",
  }
}));

const CustomCard = styled(Card)(({ theme }) => ({
  height: "100%",
  borderRadius: "16px",
  background: "white",
  transition: "all 0.3s ease-in-out",
  border: "1px solid rgba(0, 0, 0, 0.05)",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.08)",
    background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
  },
  "& .MuiCardContent-root": {
    padding: "32px 24px",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
  }
}));

const IconWrapper = styled("div")(({ color }) => ({
  background: "WHITE",
  borderRadius: "50%",
  padding: "20px",
  marginBottom: "8px",
  "& .MuiSvgIcon-root": {
    fontSize: "40px",
    color: "#592d2d"
  }
}));

const StyledButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(90deg,rgb(0, 0, 0) 0%,rgb(0, 0, 0) 100%)",
  color: "white",
  padding: "10px 24px",
  borderRadius: "8px",
  textTransform: "none",
  fontWeight: "600",
  "&:hover": {
    background: "linear-gradient(90deg,rgb(32, 22, 22) 0%, white 100%)",
  }
}));

const AdminDashboard = () => {
  // Estado para controlar la vista seleccionada:
  // "dashboard" (vista principal) o "clients" (gestión de clientes)
  const [selectedView, setSelectedView] = useState("dashboard");

  return (
    <DashboardContainer>
      {selectedView === "dashboard" && (
        <>
          <DashboardTitle variant="h4"  color="secondary">
            Panel de Administración
          </DashboardTitle>
          <Grid container spacing={4} justifyContent="center">
            {/* Crear Cliente */}
            <Grid item xs={12} sm={6} md={4}>
              <CustomCard onClick={() => setSelectedView("createClient")}>
                <CardContent>
                  <IconWrapper color="projects">
                    <PersonAddIcon />
                  </IconWrapper>
                  <Typography variant="h6" sx={{ 
                    fontWeight: "700",
                    color: "#8e3031",
                    fontSize: "1.25rem",
                    marginBottom: 1,
                  }}>
                    Gestión De Proyectos
                  </Typography>
                  <Typography variant="body1" sx={{
                    color: "#8e3031",
                    lineHeight: 1.6
                  }}>
                    Agrega y administra nuevos proyectos en el sistema
                  </Typography>
                </CardContent>
              </CustomCard>
            </Grid>

            {/* Gestionar Clientes */}
            <Grid item xs={12} sm={6} md={4}>
              <CustomCard onClick={() => setSelectedView("clients")}>
                <CardContent>
                  <IconWrapper color="clients">
                    <GroupIcon />
                  </IconWrapper>
                  <Typography variant="h6" sx={{ 
                    fontWeight: "700",
                    color: "#8e3031",
                    fontSize: "1.25rem",
                    marginBottom: 1
                  }}>
                    Gestionar Clientes
                  </Typography>
                  <Typography variant="body1" sx={{
                    color: "#8e3031",
                    lineHeight: 1.6
                  }}>
                    Administra la información de los clientes
                  </Typography>
                </CardContent>
              </CustomCard>
            </Grid>

            {/* Gestionar Roles */}
            <Grid item xs={12} sm={6} md={4}>
              <CustomCard onClick={() => setSelectedView("roles")}>
                <CardContent>
                  <IconWrapper color="tasks">
                    <SecurityIcon />
                  </IconWrapper>
                  <Typography variant="h6" sx={{ 
                    fontWeight: "700",
                    color: "#8e3031",
                    fontSize: "1.25rem",
                    marginBottom: 1
                  }}>
                    Gestionar Tareas
                  </Typography>
                  <Typography variant="body1" sx={{
                    color: "#8e3031",
                    lineHeight: 1.6
                  }}>
                    Asigna y gestiona roles de usuario
                  </Typography>
                </CardContent>
              </CustomCard>
            </Grid>
          </Grid>
        </>
      )}

      {selectedView !== "dashboard" && (
        <Box sx={{ mb: 3, display: "flex", justifyContent: "flex-start" }}>
          <StyledButton
            variant="contained"
            onClick={() => setSelectedView("dashboard")}
            startIcon={<ArrowBackIcon />}
          >
            Volver al Dashboard
          </StyledButton>
        </Box>
      )}

      {selectedView === "clients" && (
        <>
          <UserManagement />
        </>
      )}

      {selectedView === "createClient" && (
        <>
          <ProjectProvider>
            <ProjectsPage />
          </ProjectProvider>
        </>
      )}

      {selectedView === "roles" && (
        <>
          <Typography variant="h5" sx={{ mt: 2, mb: 4 }}>
            Gestión de Tareas
          </Typography>
          <TaskManagement />
        </>
      )}

    </DashboardContainer>
  );
};

export default AdminDashboard;
