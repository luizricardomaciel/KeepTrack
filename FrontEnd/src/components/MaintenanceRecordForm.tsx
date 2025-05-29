// C:/WorkHome/AlphaEdtech/React/KeepTrack/FrontEnd/src/components/MaintenanceRecordForm.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Typography,
  FormControlLabel,
  Switch,
} from "@mui/material";
import type {
  MaintenanceRecord,
  CreateMaintenanceRecordPayload,
  UpdateMaintenanceRecordPayload,
} from "../types/maintenanceRecordTypes";

interface MaintenanceRecordFormProps {
  open: boolean;
  mode: "create" | "edit";
  record?: MaintenanceRecord | null;
  assetId: number; // Always needed for create, and for context
  onClose: () => void;
  onSave: (
    data: CreateMaintenanceRecordPayload | UpdateMaintenanceRecordPayload,
    recordId?: number
  ) => Promise<void>;
  isSaving: boolean;
  apiError?: string | null;
}

const MaintenanceRecordForm: React.FC<MaintenanceRecordFormProps> = ({
  open,
  mode,
  record,
  assetId,
  onClose,
  onSave,
  isSaving,
  apiError,
}) => {
  // Mandatory fields
  const [serviceType, setServiceType] = useState("");
  const [serviceDate, setServiceDate] = useState(""); // YYYY-MM-DD

  // Optional fields controlled by checkboxes
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState<string>("");
  const [performedBy, setPerformedBy] = useState("");
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState("");
  const [nextMaintenanceNotes, setNextMaintenanceNotes] = useState("");

  // State for checkboxes
  const [showDescription, setShowDescription] = useState(false);
  const [showCost, setShowCost] = useState(false);
  const [showPerformedBy, setShowPerformedBy] = useState(false);
  const [showNextMaintenance, setShowNextMaintenance] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (mode === "edit" && record) {
        setServiceType(record.service_type);
        setServiceDate(record.service_date || "");

        const hasDescription = !!record.description;
        setDescription(record.description || "");
        setShowDescription(hasDescription);

        const hasCost = record.cost !== undefined && record.cost !== null;
        setCost(hasCost ? record.cost!.toString() : "");
        setShowCost(hasCost);

        const hasPerformedBy = !!record.performed_by;
        setPerformedBy(record.performed_by || "");
        setShowPerformedBy(hasPerformedBy);

        const hasNextMaintenanceDate = !!record.next_maintenance_date;
        const hasNextMaintenanceNotes = !!record.next_maintenance_notes;
        setNextMaintenanceDate(record.next_maintenance_date || "");
        setNextMaintenanceNotes(record.next_maintenance_notes || "");
        setShowNextMaintenance(
          hasNextMaintenanceDate || hasNextMaintenanceNotes
        );
      } else {
        setServiceType("");
        setServiceDate("");
        setDescription("");
        setShowDescription(false);
        setCost("");
        setShowCost(false);
        setPerformedBy("");
        setShowPerformedBy(false);
        setNextMaintenanceDate("");
        setNextMaintenanceNotes("");
        setShowNextMaintenance(false);
      }
      setFormError(null);
    }
  }, [open, mode, record]);

  const validateForm = (): boolean => {
    if (!serviceType.trim()) {
      setFormError("Service type is required.");
      return false;
    }
    if (!serviceDate) {
      setFormError("Service date is required.");
      return false;
    }
    if (serviceDate && !/^\d{4}-\d{2}-\d{2}$/.test(serviceDate)) {
      setFormError("Service date must be in YYYY-MM-DD format.");
      return false;
    }
    if (showCost && cost.trim() && isNaN(parseFloat(cost))) {
      setFormError("Cost must be a valid number.");
      return false;
    }
    if (
      showNextMaintenance &&
      nextMaintenanceDate.trim() &&
      !/^\d{4}-\d{2}-\d{2}$/.test(nextMaintenanceDate)
    ) {
      setFormError("Next maintenance date must be in YYYY-MM-DD format.");
      return false;
    }
    if (showNextMaintenance && serviceDate && nextMaintenanceDate.trim()) {
      const sDate = new Date(serviceDate);
      const nDate = new Date(nextMaintenanceDate);
      if (nDate < sDate) {
        setFormError(
          "Next maintenance date cannot be earlier than the service date."
        );
        return false;
      }
    }
    setFormError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const basePayload = {
      service_type: serviceType.trim(),
      service_date: serviceDate,
      description:
        showDescription && description.trim() ? description.trim() : undefined,
      cost: showCost && cost.trim() ? parseFloat(cost) : undefined,
      performed_by:
        showPerformedBy && performedBy.trim() ? performedBy.trim() : undefined,
      next_maintenance_date:
        showNextMaintenance && nextMaintenanceDate.trim()
          ? nextMaintenanceDate.trim()
          : null,
      next_maintenance_notes:
        showNextMaintenance && nextMaintenanceNotes.trim()
          ? nextMaintenanceNotes.trim()
          : undefined,
    };

    if (mode === "create") {
      const createPayload: CreateMaintenanceRecordPayload = {
        ...basePayload,
        asset_id: assetId,
      };
      await onSave(createPayload);
    } else if (record) {
      const updatePayload: UpdateMaintenanceRecordPayload = basePayload;
      await onSave(updatePayload, record.id);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {mode === "create"
          ? "Add Maintenance Record"
          : "Edit Maintenance Record"}
      </DialogTitle>
      <DialogContent>
        {formError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {formError}
          </Alert>
        )}
        {apiError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {apiError}
          </Alert>
        )}

        {/* Checkboxes Section */}
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ mt: 2, mb: 1 }}
        >
          Optional Fields:
        </Typography>
        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 6, md: "auto" }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showDescription}
                  onChange={(e) => {
                    setShowDescription(e.target.checked);
                    if (!e.target.checked) setDescription("");
                  }}
                  disabled={isSaving}
                />
              }
              label="Description"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: "auto" }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showCost}
                  onChange={(e) => {
                    setShowCost(e.target.checked);
                    if (!e.target.checked) setCost("");
                  }}
                  disabled={isSaving}
                />
              }
              label="Cost"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: "auto" }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showPerformedBy}
                  onChange={(e) => {
                    setShowPerformedBy(e.target.checked);
                    if (!e.target.checked) setPerformedBy("");
                  }}
                  disabled={isSaving}
                />
              }
              label="Performed By"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: "auto" }}>
            <FormControlLabel
              control={
                <Switch
                  checked={showNextMaintenance}
                  onChange={(e) => {
                    setShowNextMaintenance(e.target.checked);
                    if (!e.target.checked) {
                      setNextMaintenanceDate("");
                      setNextMaintenanceNotes("");
                    }
                  }}
                  disabled={isSaving}
                />
              }
              label="Next Maintenance"
            />
          </Grid>
        </Grid>

        {/* Form Fields Section */}
        <Grid container spacing={2}>
          {/* Row 1: Service Type & Date (Mandatory) */}
          <Grid size={{ xs: 12, sm: 6 }}>
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
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Service Date"
              type="date"
              value={serviceDate}
              onChange={(e) => setServiceDate(e.target.value)}
              fullWidth
              required
              disabled={isSaving}
              InputLabelProps={{ shrink: true }}
              inputProps={{ max: "9999-12-31" }}
              helperText="YYYY-MM-DD"
              variant="outlined"
            />
          </Grid>

          {/* Description - Optional */}
          {showDescription && (
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                multiline
                rows={2}
                disabled={isSaving}
                variant="outlined"
              />
            </Grid>
          )}

          {/* Cost - Optional and Smaller Width */}
          {showCost && (
            <Grid size={{ xs: 12, sm: 4 }}>
              {" "}
              {/* "o cost deixe menor" -> sm=4 */}
              <TextField
                label="Cost"
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                fullWidth
                disabled={isSaving}
                inputProps={{ step: "0.01" }}
                variant="outlined"
              />
            </Grid>
          )}

          {/* Performed By - Optional */}
          {showPerformedBy && (
            // This will appear next to Cost if Cost is also shown and takes sm={4}
            // If Cost is not shown, this will take sm={8} from the start of a new line or its current line.
            <Grid size={{ xs: 12, sm: showCost ? 8 : 12 }}>
              <TextField
                label="Performed By"
                value={performedBy}
                onChange={(e) => setPerformedBy(e.target.value)}
                fullWidth
                disabled={isSaving}
                variant="outlined"
              />
            </Grid>
          )}

          {/* Next Maintenance - Optional group */}
          {showNextMaintenance && (
            <>
              <Grid size={{ xs: 12, sm: 6 }}>
                {" "}
                {/* "next maintenance deixe do mesmo tamanho de service date" -> sm=6 */}
                <TextField
                  label="Next Maintenance Date"
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
              <Grid size={{ xs: 12, sm: 6 }}>
                {" "}
                {/* Corresponding notes field, also sm=6 */}
                <TextField
                  label="Next Maintenance Notes"
                  value={nextMaintenanceNotes}
                  onChange={(e) => setNextMaintenanceNotes(e.target.value)}
                  fullWidth
                  multiline
                  rows={2}
                  disabled={isSaving}
                  variant="outlined"
                />
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isSaving} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={isSaving}>
          {isSaving ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Save Record"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MaintenanceRecordForm;
