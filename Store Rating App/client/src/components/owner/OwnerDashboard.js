import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Rating,
  Alert,
  CircularProgress
} from '@mui/material';
import { Star, People, TrendingUp } from '@mui/icons-material';
import axios from 'axios';

const OwnerDashboard = () => {
  const [storeData, setStoreData] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStoreData();
  }, []);

  const fetchStoreData = async () => {
    try {
      const response = await axios.get('/api/stores/owner/ratings');
      setStoreData(response.data.store);
      setRatings(response.data.ratings);
    } catch (err) {
      setError('Failed to fetch store data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!storeData) {
    return (
      <Box>
        <Alert severity="warning">
          No store found for this account. Please contact an administrator.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        My Store Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Store Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {storeData.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {storeData.address}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {storeData.email}
          </Typography>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Star sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {storeData.average_rating ? storeData.average_rating.toFixed(1) : 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Average Rating</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <People sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">{ratings.length}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Ratings</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUp sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h4">
                    {ratings.length > 0 ? 
                      (ratings.filter(r => r.rating >= 4).length / ratings.length * 100).toFixed(0) : 0
                    }%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Satisfaction Rate</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Ratings Table */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Customer Ratings
          </Typography>
          
          {ratings.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                No ratings yet. Encourage your customers to rate your store!
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell>Rating</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ratings.map((rating) => (
                    <TableRow key={rating.id}>
                      <TableCell>{rating.user_name}</TableCell>
                      <TableCell>
                        <Rating value={rating.rating} readOnly size="small" />
                        <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                          ({rating.rating}/5)
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {new Date(rating.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default OwnerDashboard; 