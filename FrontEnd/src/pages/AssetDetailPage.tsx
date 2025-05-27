// C:/WorkHome/AlphaEdtech/React/KeepTrack/FrontEnd/src/pages/AssetDetailPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Container, Typography, Box, Paper, CircularProgress, Alert, Button, Grid,
   IconButton,  Card, CardContent, CardHeader, Tooltip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EventNoteIcon from '@mui/icons-material/EventNote'; // For service date
import UpdateIcon from '@mui/icons-material/Update'; // For next maintenance date
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'; // For cost
import PersonIcon from '@mui/icons-material/Person'; // For performed by


import type { Asset } from '../types/assetTypes';
import type { MaintenanceRecord, CreateMaintenanceRecordPayload, UpdateMaintenanceRecordPayload } from '../types/maintenanceRecordTypes';
import { fetchAssetById } from '../api/assetService';
import {
  fetchMaintenanceRecordsByAssetId, createMaintenanceRecordAPI, updateMaintenanceRecordAPI, deleteMaintenanceRecordAPI
} from '../api/maintenanceRecordService';
import MaintenanceRecordForm from '../components/MaintenanceRecordForm';
import ConfirmDialog from '../components/common/ConfirmDialog'; // We'll create this small utility
// import { da } from 'date-fns/locale'; // Unused import

interface AssetDetailParams extends Record<string, string | undefined> {
  assetId: string;
}

// Helper to format date string
const formatDate = (dateString: string | null | undefined, includeTime = false, includeUTC = false): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = !includeUTC 
      ? new Date(dateString + 'T00:00:00Z') 
      : new Date(dateString);

      const isoDate = date.toISOString();
      const isoDateWithoutTime = isoDate.split('T')[0];

    if (isNaN(date.getTime())) return 'Invalid Date';

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric', month: 'long', day: 'numeric'
    };
    
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
      options.hour12 = false; 
    }
    
    // For displaying date and time, use toLocaleString for browser's locale formatting.
    // For just date, isoDateWithoutTime is usually fine.
    if (includeTime) {
         return date.toLocaleString('en-CA', { // en-CA gives YYYY-MM-DD HH:MM:SS format
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        }).replace(',', ''); // Remove comma sometimes inserted by toLocaleString
    }
    return isoDateWithoutTime;

  } catch (e) {
    return dateString; // fallback
  }
};

const AssetDetailPage: React.FC = () => {
  const { assetId } = useParams<AssetDetailParams>();
  const navigate = useNavigate();
  const { user, token, isAuthenticated, isLoading: authIsLoading, logout } = useAuth();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [formApiError, setFormApiError] = useState<string | null>(null);

  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
  const [recordModalMode, setRecordModalMode] = useState<'create' | 'edit'>('create');
  const [currentRecord, setCurrentRecord] = useState<MaintenanceRecord | null>(null);
  const [isSavingRecord, setIsSavingRecord] = useState<boolean>(false);

  const [isDeleteRecordDialogOpen, setIsDeleteRecordDialogOpen] = useState<boolean>(false);
  const [recordToDelete, setRecordToDelete] = useState<MaintenanceRecord | null>(null);
  const [isDeletingRecord, setIsDeletingRecord] = useState<boolean>(false);

  const numericAssetId = Number(assetId);

  const loadAssetDetailsAndRecords = useCallback(async () => {
    if (!isAuthenticated || !token || !numericAssetId) return;
    setIsLoadingPage(true);
    setPageError(null);
    try {
      const [fetchedAsset, fetchedRecords] = await Promise.all([
        fetchAssetById(numericAssetId, token),
        fetchMaintenanceRecordsByAssetId(numericAssetId, token)
      ]);
      setAsset(fetchedAsset);
      setMaintenanceRecords(fetchedRecords);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load asset details or records.';
      setPageError(errorMessage);
      if (errorMessage.includes('Token inválido') || errorMessage.includes('Token de acesso requerido') || errorMessage.includes('Failed to fetch user profile')) {
          logout(); // Force logout if token is invalid
      }
    } finally {
      setIsLoadingPage(false);
    }
  }, [isAuthenticated, token, numericAssetId, logout]);

  useEffect(() => {
    if (!authIsLoading) {
      if (isAuthenticated && numericAssetId) {
        loadAssetDetailsAndRecords();
      } else if (!isAuthenticated) {
        navigate('/login');
      } else if (!numericAssetId) {
        setPageError("Invalid Asset ID.");
        setIsLoadingPage(false);
      }
    }
  }, [isAuthenticated, authIsLoading, numericAssetId, navigate, loadAssetDetailsAndRecords]);

  const handleOpenCreateRecordModal = () => {
    setRecordModalMode('create');
    setCurrentRecord(null);
    setFormApiError(null);
    setIsRecordModalOpen(true);
  };

  const handleOpenEditRecordModal = (record: MaintenanceRecord) => {
    setRecordModalMode('edit');
    setCurrentRecord(record);
    setFormApiError(null);
    setIsRecordModalOpen(true);
  };

  const handleCloseRecordModal = () => {
    setIsRecordModalOpen(false);
    setCurrentRecord(null);
    setFormApiError(null);
  };

  const handleSaveRecord = async (data: CreateMaintenanceRecordPayload | UpdateMaintenanceRecordPayload, recordIdToUpdate?: number) => {
    if (!token || !numericAssetId) {
      setFormApiError("Authentication token or Asset ID is missing.");
      return;
    }
    setIsSavingRecord(true);
    setFormApiError(null);
    setPageError(null); // Clear general page error
    try {
      if (recordModalMode === 'create') {
        await createMaintenanceRecordAPI(data as CreateMaintenanceRecordPayload, token);
      } else if (recordIdToUpdate) {
        await updateMaintenanceRecordAPI(recordIdToUpdate, data as UpdateMaintenanceRecordPayload, token);
      }
      await loadAssetDetailsAndRecords(); // Reload records
      handleCloseRecordModal();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save maintenance record.';
      setFormApiError(errorMessage);
    } finally {
      setIsSavingRecord(false);
    }
  };

  const handleOpenDeleteRecordDialog = (record: MaintenanceRecord) => {
    setRecordToDelete(record);
    setPageError(null);
    setIsDeleteRecordDialogOpen(true);
  };

  const handleCloseDeleteRecordDialog = () => {
    setRecordToDelete(null);
    setIsDeleteRecordDialogOpen(false);
  };

  const handleConfirmDeleteRecord = async () => {
    if (!recordToDelete || !token) return;
    setIsDeletingRecord(true);
    setPageError(null);
    try {
      await deleteMaintenanceRecordAPI(recordToDelete.id, token);
      await loadAssetDetailsAndRecords(); // Reload records
      handleCloseDeleteRecordDialog();
    } catch (error)
 {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete maintenance record.';
      setPageError(errorMessage); // Show error on the page
    } finally {
      setIsDeletingRecord(false);
    }
  };

  if (authIsLoading || isLoadingPage) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress color="primary" />
      </Container>
    );
  }

  if (pageError && !asset) { // Show critical error if asset couldn't be loaded
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>{pageError}</Alert>
        <Button component={RouterLink} to="/home" startIcon={<ArrowBackIcon />} sx={{ mt: 2 }} color="primary">
          Back to Home
        </Button>
      </Container>
    );
  }
  
  if (!asset) {
     return (
      <Container>
        <Typography sx={{mt:2}} color="text.secondary">Asset not found or an error occurred.</Typography>
         <Button component={RouterLink} to="/home" startIcon={<ArrowBackIcon />} sx={{ mt: 2 }} color="primary">
          Back to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Button component={RouterLink} to="/home" startIcon={<ArrowBackIcon />} sx={{ mb: 2 }} color="inherit">
        Back to Assets
      </Button>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom color="text.primary">{asset.name}</Typography>
        <Typography variant="body1" color="text.primary" sx={{ mb: 1 }}>
          {asset.description || 'No description provided.'}
        </Typography>
        <Typography variant="caption" display="block" color="text.secondary">
            Created: {formatDate(asset.created_at, true, true)} | Last Updated: {formatDate(asset.updated_at, true, true)}
        </Typography>
      </Paper>

      {pageError && <Alert severity="error" sx={{ mb: 2 }}>{pageError}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2" color="text.primary">Maintenance History</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateRecordModal}
          color="primary"
        >
          Add Record
        </Button>
      </Box>

      {maintenanceRecords.length === 0 ? (
        <Paper elevation={1} sx={{ p: 3, textAlign: 'center' /* Removed backgroundColor: 'grey.50' */ }}>
          <Typography variant="subtitle1" color="text.secondary">
            No maintenance records found for this asset.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {maintenanceRecords.map((record) => (
            <Grid  key={record.id}> {/* Ensure Grid item takes space */}
              <Card elevation={2} sx={{height: '100%'}}> {/* Ensure cards take full height of grid item if desired */}
                <CardHeader
                  titleTypographyProps={{color: "text.primary"}}
                  subheaderTypographyProps={{color: "text.secondary"}}
                  title={record.service_type}
                  subheader={`Service Date: ${formatDate(record.service_date)}`}
                  action={
                    <Box>
                      <Tooltip title="Edit Record">
                        <IconButton onClick={() => handleOpenEditRecordModal(record)} size="small" color="primary">
                          <EditIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Record">
                        <IconButton onClick={() => handleOpenDeleteRecordDialog(record)} size="small" color="error">
                          <DeleteIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                  sx={{pb:0}}
                />
                <CardContent sx={{pt:1}}>
                  {record.description && (
                    <Typography variant="body2" sx={{ mb: 1 }} color="text.primary">
                      <strong>Description:</strong> {record.description}
                    </Typography>
                  )}
                  <Grid container spacing={1} sx={{color: 'text.secondary', fontSize: '0.875rem'}}>
                    {record.cost && (
                      <Grid  sx={{display: 'flex', alignItems: 'center'}}>
                        <AttachMoneyIcon fontSize="inherit" sx={{mr:0.5}}/> Cost: ${record.cost}
                      </Grid>
                    )}
                    {record.performed_by && (
                      <Grid  sx={{display: 'flex', alignItems: 'center'}}>
                        <PersonIcon fontSize="inherit" sx={{mr:0.5}}/> Performed by: {record.performed_by}
                      </Grid>
                    )}
                    {record.next_maintenance_date && (
                      <Grid sx={{display: 'flex', alignItems: 'center'}}> {/* Ensure full width for this item */}
                         <UpdateIcon fontSize="inherit" sx={{mr:0.5}}/> <strong>Next Due:</strong> {formatDate(record.next_maintenance_date)}
                      </Grid>
                    )}
                    {record.next_maintenance_date && record.next_maintenance_notes && (
                       <Grid sx={{pl: {xs:0, sm:'24px !important'}, mt:0.5 }}> {/* Adjust padding for notes */}
                           <Typography variant="caption" component="div" color="text.secondary">Notes: {record.next_maintenance_notes}</Typography>
                       </Grid>
                    )}
                  </Grid>
                  <Typography variant="caption" display="block" color="text.disabled" sx={{mt:1, textAlign:'right'}}>
                    Recorded: {formatDate(record.created_at, true, true)} {/* Ensure UTC used for consistency */}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {numericAssetId && (
        <MaintenanceRecordForm
            open={isRecordModalOpen}
            mode={recordModalMode}
            record={currentRecord}
            assetId={numericAssetId}
            onClose={handleCloseRecordModal}
            onSave={handleSaveRecord}
            isSaving={isSavingRecord}
            apiError={formApiError}
        />
      )}

      <ConfirmDialog
        open={isDeleteRecordDialogOpen}
        onClose={handleCloseDeleteRecordDialog}
        onConfirm={handleConfirmDeleteRecord}
        title="Confirm Delete Maintenance Record"
        message={`Are you sure you want to delete the maintenance record for "${recordToDelete?.service_type}" on ${formatDate(recordToDelete?.service_date)}? This action cannot be undone.`}
        isWorking={isDeletingRecord}
        confirmText="Delete"
      />

    </Container>
  );
};

export default AssetDetailPage;