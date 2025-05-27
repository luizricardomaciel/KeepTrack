// C:/WorkHome/AlphaEdtech/React/KeepTrack/FrontEnd/src/pages/HomePage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Typography, Container, Box, Paper, Button, List, ListItem, ListItemText, ListItemSecondaryAction,
  IconButton, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Grid, Card, CardContent, CardActions, Divider
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import type { Asset, CreateAssetPayload, UpdateAssetPayload } from '../types/assetTypes';
import { fetchAssets, createAssetAPI, updateAssetAPI, deleteAssetAPI } from '../api/assetService';
import AssetForm from '../components/AssetForm';
import iconNoAssets from '../assets/placeholder-no-assets.svg'; 

const HomePage: React.FC = () => {
  const { isAuthenticated, user, token, isLoading: authIsLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState<boolean>(false);
  const [pageError, setPageError] = useState<string | null>(null); // For general page errors
  const [formApiError, setFormApiError] = useState<string | null>(null); // For errors within the AssetForm

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentAsset, setCurrentAsset] = useState<Asset | null>(null);
  const [isSavingAsset, setIsSavingAsset] = useState<boolean>(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [isDeletingAsset, setIsDeletingAsset] = useState<boolean>(false);

  const loadAssets = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    setIsLoadingAssets(true);
    setPageError(null);
    try {
      const fetchedAssets = await fetchAssets(token);
      setAssets(fetchedAssets);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load assets.';
      setPageError(errorMessage);
      if (errorMessage.includes('Token inválido') || errorMessage.includes('Token de acesso requerido') || errorMessage.includes('Failed to fetch user profile')) {
          logout(); 
      }
    } finally {
      setIsLoadingAssets(false);
    }
  }, [isAuthenticated, token, logout]);

  useEffect(() => {
    if (!authIsLoading) {
      if (isAuthenticated) {
        loadAssets();
      } else {
        navigate('/login');
      }
    }
  }, [isAuthenticated, authIsLoading, navigate, loadAssets]);


  const handleOpenCreateModal = () => {
    setModalMode('create');
    setCurrentAsset(null);
    setFormApiError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (asset: Asset) => {
    setModalMode('edit');
    setCurrentAsset(asset);
    setFormApiError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentAsset(null);
    setFormApiError(null);
  };

  const handleSaveAsset = async (data: CreateAssetPayload | UpdateAssetPayload) => {
    if (!token) {
      setFormApiError("Authentication token is missing. Please log in again.");
      return;
    }
    setIsSavingAsset(true);
    setFormApiError(null);
    setPageError(null);
    try {
      if (modalMode === 'create') {
        await createAssetAPI(data as CreateAssetPayload, token);
      } else if (currentAsset) {
        await updateAssetAPI(currentAsset.id, data as UpdateAssetPayload, token);
      }
      await loadAssets(); 
      handleCloseModal();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save asset.';
      setFormApiError(errorMessage); // Show error in the form
    } finally {
      setIsSavingAsset(false);
    }
  };
  
  const handleOpenDeleteDialog = (asset: Asset) => {
    setAssetToDelete(asset);
    setPageError(null); // Clear previous page errors before showing dialog
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setAssetToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const handleConfirmDeleteAsset = async () => {
    if (!assetToDelete || !token) return;
    setIsDeletingAsset(true);
    setPageError(null);
    try {
      await deleteAssetAPI(assetToDelete.id, token);
      await loadAssets(); 
      handleCloseDeleteDialog();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete asset.';
      setPageError(errorMessage); // Show error on the page after dialog closes or if it stays open
    } finally {
      setIsDeletingAsset(false);
    }
  };

  if (authIsLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress color="primary" />
        <Typography sx={{ ml: 2, color: 'text.secondary' }}>Loading user data...</Typography>
      </Container>
    );
  }

  if (!isAuthenticated || !user) {
    return null; 
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Paper elevation={3} sx={{ p: 3, mb: 3, backgroundColor: 'background.paper' /* Using theme's paper color */ }}>
          <Typography variant="h4" component="h1" gutterBottom color="text.primary">
            Welcome, {user.name}!
          </Typography>
          <Typography variant="body1" color="text.primary">
            This is your asset management dashboard. Keep track of your valuable items and their maintenance schedules.
          </Typography>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2" color="text.primary">
            Your Assets
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateModal}
            color="primary" // This will use theme.palette.primary.main and .contrastText
          >
            Add New Asset
          </Button>
        </Box>

        {pageError && <Alert severity="error" sx={{ mb: 2 }}>{pageError}</Alert>}

        {isLoadingAssets ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress size={50} color="primary"/>
          </Box>
        ) : assets.length === 0 && !pageError ? (
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No Assets Found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              You haven't added any assets yet. Click "Add New Asset" to get started.
            </Typography>
            <img src={iconNoAssets} alt="No assets" style={{ maxHeight: 150, opacity: 0.7 }}/>
          </Paper>
        ) : (
         <Grid container spacing={3}>
            {assets.map((asset) => (
              <Grid key={asset.id}>
                <Card 
                  elevation={2} 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    height: '100%',
                    transition: 'box-shadow 0.3s ease-in-out, transform 0.2s ease-in-out', // Added transition
                    '&:hover': {
                        boxShadow: '0px 10px 20px rgba(190, 242, 100, 0.2)', // Primary color shadow
                        transform: 'translateY(-4px)', // Lift effect
                        cursor: 'pointer'
                    }
                  }}
                  onClick={() => navigate(`/assets/${asset.id}`)} // Navigate on click
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div" gutterBottom color="text.primary">
                      {asset.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ minHeight: '3em', overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {asset.description || 'No description provided.'}
                    </Typography>
                  </CardContent>
                  <Divider /> {/* Divider will use theme.palette.divider */}
                  <CardActions sx={{ justifyContent: 'space-between', p:1 }}> {/* Changed justifyContent */}
                    <Button 
                        component={RouterLink} 
                        to={`/assets/${asset.id}`} 
                        size="small"
                        color="primary" // Text color will be primary.main
                    >
                        View Details
                    </Button>
                    <Box> {/* Wrapper for action buttons */}
                        <IconButton aria-label="edit" onClick={(e) => {e.stopPropagation(); handleOpenEditModal(asset);}} color="primary" size="small">
                            <EditIcon fontSize="small"/>
                        </IconButton>
                        <IconButton aria-label="delete" onClick={(e) => {e.stopPropagation(); handleOpenDeleteDialog(asset);}} color="error" size="small">
                            <DeleteIcon fontSize="small"/>
                        </IconButton>
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <AssetForm
        open={isModalOpen}
        mode={modalMode}
        asset={currentAsset}
        onClose={handleCloseModal}
        onSave={handleSaveAsset}
        isSaving={isSavingAsset}
        apiError={formApiError}
      />
      
      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" color="text.primary">Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" color="text.secondary">
            Are you sure you want to delete the asset "{assetToDelete?.name}"? This action cannot be undone.
            All associated maintenance records will also be deleted.
          </DialogContentText>
           {/* Display specific deletion error inside the dialog if needed */}
           {isDeletingAsset && pageError && <Alert severity="error" sx={{ mt: 2 }}>{pageError}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDeleteDialog} disabled={isDeletingAsset} color="inherit">Cancel</Button>
          <Button onClick={handleConfirmDeleteAsset} color="error" autoFocus disabled={isDeletingAsset}>
            {isDeletingAsset ? <CircularProgress size={24} color="inherit"/> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
};

export default HomePage;