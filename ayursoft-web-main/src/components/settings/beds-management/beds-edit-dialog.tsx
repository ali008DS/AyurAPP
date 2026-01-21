import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import { useState, useEffect } from "react";
import ApiManager from '../../services/apimanager';
import { Box, IconButton } from "@mui/material";
import { Add, Remove } from "@mui/icons-material";

const bedTypes = ['Child', 'Elder', 'Handicap', 'General'];
const floors = ['Upper', 'Ground'];
const floorMap: Record<string, string> = { Ground: 'floor0', Upper: 'floor1' };

interface BedsEditDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (bed: any) => void;
  bed?: any; // The bed to edit
}

export default function BedsEditDialog({
  open,
  onClose,
  onSuccess,
  bed,
}: BedsEditDialogProps) {
  // Pre-fill state with bed data if editing
  const [type, setType] = useState(bed ? capitalize(bed.bedType) : bedTypes[0]);
  const [bedFloor, setBedFloor] = useState(bed ? getFloorName(bed.floor) : floors[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bedCounter, setBedCounter] = useState(bed ? getBedCounter(bed.bedId) : 1);

  useEffect(() => {
    if (bed) {
      setType(capitalize(bed.bedType));
      setBedFloor(getFloorName(bed.floor));
      setBedCounter(getBedCounter(bed.bedId));
    }
  }, [bed, open]);

  function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function getFloorName(floorKey: string) {
    return floorKey === 'floor0' ? 'Ground' : 'Upper';
  }

  function getBedCounter(bedId: string) {
    // Assumes bedId is like "BED-001"
    const parts = bedId.split('-');
    return Number(parts[1]);
  }

  const getCounterRange = (floorKey: string) => {
    return floorKey === 'floor0' ? { min: 1, max: 99 } : { min: 101, max: 199 };
  };

  const handleFloorChange = (value: string) => {
    setBedFloor(value);
    const floorKey = floorMap[value];
    const { min } = getCounterRange(floorKey);
    setBedCounter(min);
  };

  const getManualBedId = () => {
    const counter = String(bedCounter).padStart(3, '0');
    return `BED-${counter}`;
  };

  const handleBedSubmit = async () => {
    if (loading) return; // Prevent double trigger at the very start
    setLoading(true);
    setError(null);
    const floorKey = floorMap[bedFloor];
    let bedId: string = getManualBedId();
    const { min, max } = getCounterRange(floorKey);
    if (bedCounter < min || bedCounter > max) {
      setError(`Bed ID must be between BED-${String(min).padStart(3, '0')} and BED-${max}`);
      setLoading(false);
      return;
    }
    const payload = {
      bedId,
      bedType: type.toLowerCase(),
      floor: floorKey,
    };
    try {
      // Use the MongoDB _id for the API call, not the bedId
      const result = await ApiManager.patchBed(bed._id, payload);
      onSuccess({
        ...result,
        bedId: bedId,
        type: type.toLowerCase(),
        floor: floorKey
      });
      onClose();
    } catch (e: any) {
      setError(e.message || 'Error updating bed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Bed</DialogTitle>
      <DialogContent>
        <TextField
          select
          label="Floor"
          value={bedFloor}
          onChange={e => handleFloorChange(e.target.value)}
          fullWidth
          sx={{ my: 1 }}
        >
          {floors.map(f => (
            <MenuItem key={f} value={f}>{f}</MenuItem>
          ))}
        </TextField>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 1 }}>
          <TextField
            label="Bed Prefix"
            value="BED-"
            disabled
            sx={{ width: '50%' }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', width: '50%' }}>
            <IconButton
              onClick={() => {
                const { min } = getCounterRange(floorMap[bedFloor]);
                if (bedCounter > min) setBedCounter(bedCounter - 1);
              }}
              disabled={bedCounter <= getCounterRange(floorMap[bedFloor]).min}
              size="small"
            >
              <Remove fontSize="small" />
            </IconButton>
            <TextField
              label="Counter"
              type="number"
              value={bedCounter}
              onChange={e => {
                const val = Number(e.target.value);
                const { min, max } = getCounterRange(floorMap[bedFloor]);
                if (val >= min && val <= max) setBedCounter(val);
              }}
              sx={{ width: 200, mx: 1 }}
              inputProps={{ min: getCounterRange(floorMap[bedFloor]).min, max: getCounterRange(floorMap[bedFloor]).max, style: { textAlign: 'center' } }}
            />
            <IconButton
              onClick={() => {
                const { max } = getCounterRange(floorMap[bedFloor]);
                if (bedCounter < max) setBedCounter(bedCounter + 1);
              }}
              disabled={bedCounter >= getCounterRange(floorMap[bedFloor]).max}
              size="small"
            >
              <Add fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        <TextField
          select
          label="Bed Type"
          value={type}
          onChange={e => setType(e.target.value)}
          fullWidth
          sx={{ my: 1 }}
        >
          {bedTypes.map(t => (
            <MenuItem key={t} value={t}>{t}</MenuItem>
          ))}
        </TextField>
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleBedSubmit} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
