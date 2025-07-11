import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  Rating,
  Alert,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { Search } from '@mui/icons-material';
import axios from 'axios';

const StoreList = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [userRatings, setUserRatings] = useState({});

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await axios.get('/api/stores');
      setStores(response.data);
      // Fetch user ratings for each store
      const ratings = {};
      for (const store of response.data) {
        try {
          const ratingResponse = await axios.get(`/api/ratings/user/${store.id}`);
          ratings[store.id] = ratingResponse.data.rating;
        } catch (err) {
          // User hasn't rated this store yet
          ratings[store.id] = null;
        }
      }
      setUserRatings(ratings);
    } catch (err) {
      setError('Failed to fetch stores');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = async (storeId, newRating) => {
    try {
      await axios.post('/api/ratings', {
        store_id: parseInt(storeId, 10),
        rating: newRating
      });
      setUserRatings(prev => ({
        ...prev,
        [storeId]: newRating
      }));
      // Refresh stores to update average ratings
      fetchStores();
    } catch (err) {
      setError('Failed to submit rating');
    }
  };

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Stores
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search stores by name or address..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />

      <Grid container spacing={3}>
        {filteredStores.map((store) => (
          <Grid item xs={12} md={6} lg={4} key={store.id}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {store.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {store.address}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {store.email}
                </Typography>
                
                <Box display="flex" alignItems="center" mb={2}>
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    Average Rating:
                  </Typography>
                  <Rating
                    value={store.average_rating || 0}
                    readOnly
                    size="small"
                  />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    ({store.total_ratings || 0} ratings)
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" gutterBottom>
                    Your Rating:
                  </Typography>
                  <Rating
                    value={userRatings[store.id] || 0}
                    onChange={(event, newValue) => {
                      if (newValue) {
                        handleRatingChange(store.id, newValue);
                      }
                    }}
                    size="large"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredStores.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            No stores found matching your search.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default StoreList; 