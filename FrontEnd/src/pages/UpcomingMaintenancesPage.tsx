import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Container, Typography, Box, Paper, CircularProgress, Alert, Grid,
  Card, CardContent, CardHeader, Button, Tooltip
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event'; // For date
import EventNoteIcon from '@mui/icons-material/EventNote'; // For day of week
import AssignmentIcon from '@mui/icons-material/Assignment'; // For service type
import DevicesOtherIcon from '@mui/icons-material/DevicesOther'; // For asset name
import NotesIcon from '@mui/icons-material/Notes'; // For notes

import type { UpcomingMaintenanceRecord } from '../types/maintenanceRecordTypes';
import { fetchUpcomingMaintenancesForPanel } from '../api/maintenanceRecordService';

// Helper to format date string (copied from AssetDetailPage for now)
const formatDate = (dateString: string | null | undefined, includeTime = false, includeUTC = false): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = !includeUTC 
      ? new Date(dateString + 'T00:00:00Z') // Treat as UTC for consistency if only date string
      : new Date(dateString); // If it's a full ISO string with timezone

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
    
    if (includeTime) {
         return date.toLocaleString('en-CA', { 
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        }).replace(',', ''); 
    }
    return isoDateWithoutTime;

  } catch (e) {
    return dateString; // fallback
  }
};

const getDayOfWeek = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    // dateString is 'YYYY-MM-DD'. Parse as UTC to avoid timezone shifts for date-only values.
    const [year, month, day] = dateString.split('-').map(Number);
    const utcDate = new Date(Date.UTC(year, month - 1, day)); // month is 0-indexed

    if (isNaN(utcDate.getTime())) return 'Invalid Date';
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[utcDate.getUTCDay()];
  } catch (e) {
    console.error("Error getting day of week:", e);
    return 'N/A';
  }
};

const UpcomingMaintenancesPage: React.FC = () => {
  const navigate = useNavigate();
  const { token, isAuthenticated, isLoading: authIsLoading, logout } = useAuth();

  const [upcomingMaintenances, setUpcomingMaintenances] = useState<UpcomingMaintenanceRecord[]>([]);
  const [isLoadingPage, setIsLoadingPage] = useState<boolean>(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const loadUpcomingMaintenances = useCallback(async () => {
    if (!isAuthenticated || !token) return;
    setIsLoadingPage(true);
    setPageError(null);
    try {
      const fetchedMaintenances = await fetchUpcomingMaintenancesForPanel(token);
      setUpcomingMaintenances(fetchedMaintenances);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load upcoming maintenances.';
      setPageError(errorMessage);
      if (errorMessage.includes('Token inválido') || errorMessage.includes('Token de acesso requerido') || errorMessage.includes('Failed to fetch user profile')) {
          logout(); 
      }
    } finally {
      setIsLoadingPage(false);
    }
  }, [isAuthenticated, token, logout]);

  useEffect(() => {
    if (!authIsLoading) {
      if (isAuthenticated) {
        loadUpcomingMaintenances();
      } else {
        navigate('/login');
      }
    }
  }, [isAuthenticated, authIsLoading, navigate, loadUpcomingMaintenances]);

  if (authIsLoading || isLoadingPage) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress color="primary" />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom color="text.primary">
        Upcoming Maintenances
      </Typography>

      {pageError && <Alert severity="error" sx={{ mb: 2 }}>{pageError}</Alert>}

      {upcomingMaintenances.length === 0 && !pageError ? (
        <Paper elevation={1} sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="subtitle1" color="text.secondary">
            No upcoming maintenance records found.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {upcomingMaintenances.map((record) => (
            <Grid  key={`${record.asset_id}-${record.service_type}-${record.id}`}>
              <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardHeader
                  titleTypographyProps={{color: "text.primary", variant: 'h6'}}
                  subheaderTypographyProps={{color: "text.secondary"}}
                  title={
                    <Tooltip title="View Asset Details">
                      <Button 
                        component={RouterLink} 
                        to={`/assets/${record.asset_id}`}
                        sx={{ p: 0, textTransform: 'none', justifyContent: 'flex-start' }}
                        color="inherit" // To inherit text.primary from titleTypographyProps
                      >
                        <DevicesOtherIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} fontSize="small" />
                        {record.asset_name}
                      </Button>
                    </Tooltip>
                  }
                  subheader={
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <AssignmentIcon sx={{ mr: 0.5, color: 'text.secondary' }} fontSize="inherit" />
                      {record.service_type}
                    </Box>
                  }
                  sx={{pb:0}}
                />
                <CardContent sx={{pt:1, flexGrow: 1}}>
                  <Grid container spacing={1} sx={{color: 'text.secondary', fontSize: '0.875rem'}}>
                    {record.next_maintenance_date && (
                      <>
                        <Grid  sx={{display: 'flex', alignItems: 'center'}}>
                           <EventIcon fontSize="inherit" sx={{mr:0.5, color: 'primary.light'}}/> 
                           <strong>Next Due:</strong> {formatDate(record.next_maintenance_date)}
                        </Grid>
                        <Grid  sx={{display: 'flex', alignItems: 'center', pl: '28px !important' /* Align with text above */ }}>
                           <EventNoteIcon fontSize="inherit" sx={{mr:0.5, color: 'primary.light'}}/> 
                           Day: {getDayOfWeek(record.next_maintenance_date)}
                        </Grid>
                      </>
                    )}
                     {record.next_maintenance_notes && (
                       <Grid  sx={{mt:1, display: 'flex', alignItems: 'flex-start'}}>
                           <NotesIcon fontSize="inherit" sx={{mr:0.5, mt: '2px', color: 'text.disabled'}}/>
                           <Typography variant="caption" component="div" color="text.secondary" sx={{flexGrow:1}}>
                             Notes: {record.next_maintenance_notes}
                           </Typography>
                       </Grid>
                    )}
                     {!record.next_maintenance_date && (
                        <Grid  sx={{mt:1, display: 'flex', alignItems: 'flex-start'}}>
                            <Typography variant="caption" color="text.disabled">No upcoming date set for this service type.</Typography>
                        </Grid>
                     )}
                  </Grid>
                </CardContent>
                <Box sx={{p:1, textAlign: 'right'}}>
                    <Typography variant="caption" display="block" color="text.disabled" >
                        Last Service: {formatDate(record.service_date)}
                    </Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default UpcomingMaintenancesPage;