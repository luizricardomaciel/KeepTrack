// C:/WorkHome/AlphaEdtech/React/KeepTrack/FrontEnd/src/components/AssetForm.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, CircularProgress, Alert
} from '@mui/material';
import type { Asset, CreateAssetPayload, UpdateAssetPayload } from '../types/assetTypes';

interface AssetFormProps {
  open: boolean;
  mode: 'create' | 'edit';
  asset?: Asset | null;
  onClose: () => void;
  onSave: (data: CreateAssetPayload | UpdateAssetPayload) => Promise<void>;
  isSaving: boolean;
  apiError?: string | null; // To display API errors from parent
}

const AssetForm: React.FC<AssetFormProps> = ({ open, mode, asset, onClose, onSave, isSaving, apiError }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (open) { // Reset form only when opening
      if (mode === 'edit' && asset) {
        setName(asset.name);
        setDescription(asset.description || '');
      } else {
        setName('');
        setDescription('');
      }
      setFormError(null); // Clear local form error
    }
  }, [open, mode, asset]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setFormError('Asset name is required.');
      return;
    }
    setFormError(null);
    const payload: CreateAssetPayload | UpdateAssetPayload = {
      name: name.trim(),
      // Send description only if it has a value, otherwise let backend handle default (null)
      description: description.trim() ? description.trim() : undefined,
    };
    await onSave(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{mode === 'create' ? 'Create New Asset' : 'Edit Asset'}</DialogTitle>
      <DialogContent>
        {formError && <Alert severity="warning" sx={{ mb: 2 }}>{formError}</Alert>}
        {apiError && <Alert severity="error" sx={{ mb: 2 }}>{apiError}</Alert>}
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Asset Name"
          type="text"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isSaving}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          id="description"
          label="Description (Optional)"
          type="text"
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSaving}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isSaving} color="inherit">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isSaving}>
          {isSaving ? <CircularProgress size={24} color="inherit" /> : (mode === 'create' ? 'Create' : 'Save Changes')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssetForm;