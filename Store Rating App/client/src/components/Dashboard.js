import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Box, Typography, Paper, Grid, Button, Link } from '@mui/material';
import { Person, Store } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'owner': return 'Store Owner';
      case 'user': return 'User';
      default: return role;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome, {user.name}!
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Role: {getRoleDisplayName(user.role)}
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Person sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Profile Information</Typography>
            </Box>
            <Typography variant="body1" gutterBottom>
              <strong>Name:</strong> {user.name}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Email:</strong> {user.email}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Address:</strong> {user.address}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Store sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Quick Actions</Typography>
            </Box>
            <Box display="flex" flexDirection="column" gap={2}>
              <Button component={RouterLink} to="/stores" variant="outlined">Browse and rate stores</Button>
              <Button component={RouterLink} to="/dashboard" variant="outlined">View your rating history</Button>
              {user.role === 'admin' && (
                <>
                  <Button component={RouterLink} to="/admin" variant="outlined">Manage users and stores</Button>
                  <Button component={RouterLink} to="/admin" variant="outlined">View system statistics</Button>
                </>
              )}
              {user.role === 'owner' && (
                <>
                  <Button component={RouterLink} to="/owner" variant="outlined">View your store ratings</Button>
                  <Button component={RouterLink} to="/owner" variant="outlined">Monitor customer feedback</Button>
                </>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 