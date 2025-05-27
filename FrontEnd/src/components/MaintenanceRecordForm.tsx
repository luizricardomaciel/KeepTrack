// C:/WorkHome/AlphaEdtech/React/KeepTrack/FrontEnd/src/components/MaintenanceRecordForm.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, CircularProgress, Alert, Grid
} from '@mui/material';
import type { MaintenanceRecord, CreateMaintenanceRecordPayload, UpdateMaintenanceRecordPayload } from '../types/maintenanceRecordTypes';

interface MaintenanceRecordFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  record?: MaintenanceRecord | null;
  assetId: number; // Always needed for create, and for context
  onClose: () => void;
  onSave: (data: CreateMaintenanceRecordPayload | UpdateMaintenanceRecordPayload, recordId?: number) => Promise<void>;
  isSaving: boolean;
  apiError?: string | null;
}

const MaintenanceRecordForm: React.FC<MaintenanceRecordFormProps> = ({
  open, mode, record, assetId, onClose, onSave, isSaving, apiError
}) => {
  const [serviceType, setServiceType] = useState('');
  const [serviceDate, setServiceDate] = useState(''); // YYYY-MM-DD
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState<string>(''); // Store as string for input, convert to number on save
  const [performedBy, setPerformedBy] = useState('');
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState(''); // YYYY-MM-DD
  const [nextMaintenanceNotes, setNextMaintenanceNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && record) {
        setServiceType(record.service_type);
        setServiceDate(record.service_date || ''); // Ensure it's string
        setDescription(record.description || '');
        setCost(record.cost?.toString() || '');
        setPerformedBy(record.performed_by || '');
        setNextMaintenanceDate(record.next_maintenance_date || '');
        setNextMaintenanceNotes(record.next_maintenance_notes || '');
      } else {
        // Reset for create mode or if no record
        setServiceType('');
        setServiceDate('');
        setDescription('');
        setCost('');
        setPerformedBy('');
        setNextMaintenanceDate('');
        setNextMaintenanceNotes('');
      }
      setFormError(null);
    }
  }, [open, mode, record]);

  const validateForm = (): boolean => {
    if (!serviceType.trim()) {
      setFormError('Service type is required.');
      return false;
    }
    if (!serviceDate) {
      setFormError('Service date is required.');
      return false;
    }
    // Basic date format check (YYYY-MM-DD) - more robust validation can be added
    if (serviceDate && !/^\d{4}-\d{2}-\d{2}$/.test(serviceDate)) {
        setFormError('Service date must be in YYYY-MM-DD format.');
        return false;
    }
    if (nextMaintenanceDate && !/^\d{4}-\d{2}-\d{2}$/.test(nextMaintenanceDate)) {
        setFormError('Next maintenance date must be in YYYY-MM-DD format or empty.');
        return false;
    }
    if (cost && isNaN(parseFloat(cost))) {
      setFormError('Cost must be a valid number.');
      return false;
    }
    // Check if next_maintenance_date is before service_date
    if (serviceDate && nextMaintenanceDate) {
        const sDate = new Date(serviceDate);
        const nDate = new Date(nextMaintenanceDate);
        if (nDate < sDate) {
            setFormError('Next maintenance date cannot be earlier than the service date.');
            return false;
        }
    }

    setFormError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const costValue = cost.trim() ? parseFloat(cost) : undefined;

    const payload = {
      service_type: serviceType.trim(),
      service_date: serviceDate,
      description: description.trim() || undefined,
      cost: costValue,
      performed_by: performedBy.trim() || undefined,
      next_maintenance_date: nextMaintenanceDate.trim() || null, // Send null if empty
      next_maintenance_notes: nextMaintenanceNotes.trim() || undefined,
    };

    if (mode === 'create') {
      await onSave({ ...payload, asset_id: assetId });
    } else if (record) {
      await onSave(payload, record.id);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{backgroundColor: "#27272A"}}>{mode === 'create' ? 'Add Maintenance Record' : 'Edit Maintenance Record'}</DialogTitle>
      <DialogContent sx={{backgroundColor: "#27272A"}}>
        {formError && <Alert severity="warning" sx={{ mb: 2 }}>{formError}</Alert>}
        {apiError && <Alert severity="error" sx={{ mb: 2 }}>{apiError}</Alert>}
        <Grid container spacing={2} sx={{pt:1}}>
          <Grid >
            <TextField
              label="Service Type"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              fullWidth
              required
              disabled={isSaving}
              variant="outlined"
            />
          </Grid>
          <Grid >
            <TextField
              label="Service Date"
              type="date"
              value={serviceDate}
              onChange={(e) => setServiceDate(e.target.value)}
              fullWidth
              required
              disabled={isSaving}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: "9999-12-31" }} // To assist with native date picker format
              helperText="YYYY-MM-DD"
              variant="outlined"
            />
          </Grid>
          <Grid >
            <TextField
              label="Description (Optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
              disabled={isSaving}
              variant="outlined"
            />
          </Grid>
          <Grid >
            <TextField
              label="Cost (Optional)"
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              fullWidth
              disabled={isSaving}
              inputProps={{ step: "0.01" }}
              variant="outlined"
            />
          </Grid>
          <Grid >
            <TextField
              label="Performed By (Optional)"
              value={performedBy}
              onChange={(e) => setPerformedBy(e.target.value)}
              fullWidth
              disabled={isSaving}
              variant="outlined"
            />
          </Grid>
          <Grid >
            <TextField
              label="Next Maintenance Date (Optional)"
              type="date"
              value={nextMaintenanceDate}
              onChange={(e) => setNextMaintenanceDate(e.target.value)}
              fullWidth
              disabled={isSaving}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: "9999-12-31" }}
              helperText="YYYY-MM-DD or empty"
              variant="outlined"
            />
          </Grid>
          <Grid >
            <TextField
              label="Next Maintenance Notes (Optional)"
              value={nextMaintenanceNotes}
              onChange={(e) => setNextMaintenanceNotes(e.target.value)}
              fullWidth
              multiline
              rows={2}
              disabled={isSaving}
              variant="outlined"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, backgroundColor: "#27272A" }}>
        <Button onClick={onClose} disabled={isSaving} color="inherit">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isSaving}>
          {isSaving ? <CircularProgress size={24} color="inherit" /> : 'Save Record'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MaintenanceRecordForm;