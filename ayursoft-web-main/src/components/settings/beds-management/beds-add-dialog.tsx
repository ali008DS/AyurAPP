import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import { useState } from "react";
import ApiManager from '../../services/apimanager';
import { Box, IconButton } from "@mui/material";
import { Add, Remove } from "@mui/icons-material";

export enum CarePlanGroupType {
  BENEFIT = 'benefit',
  RISK = 'risk',
  ALTERNATIVE = 'alternative',
  OUTCOME = 'outcome',
  PATHYA = 'pathya',
  APATHYA = 'apathya',
  PREVENTIVE = 'preventive',
  CURATIVE = 'curative',
  REHABILATIVE = 'rehabilitative',
}

const bedTypes = ['Child', 'Elder', 'Handicap', 'General'];
const floors = ['Upper', 'Ground'];
const floorMap: Record<string, string> = { Ground: 'floor0', Upper: 'floor1' };

interface BedsAddDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (bed: any) => void;
  floor?: string;
}

export default function BedsAddDialog({
  open,
  onClose,
  onSuccess,
  floor,
}: BedsAddDialogProps) {
  const [type, setType] = useState(bedTypes[0]);
  const [bedFloor, setBedFloor] = useState(floor || floors[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bedCounter, setBedCounter] = useState(1);

  // Get min/max for counter based on floor
  const getCounterRange = (floorKey: string) => {
    return floorKey === 'floor0' ? { min: 1, max: 99 } : { min: 101, max: 199 };
  };

  // When floor changes, reset counter to min for that floor
  const handleFloorChange = (value: string) => {
    setBedFloor(value);
    const floorKey = floorMap[value];
    const { min } = getCounterRange(floorKey);
    setBedCounter(min);
  };

  // Compose full bedId from prefix and counter
  const getManualBedId = () => {
    const counter = String(bedCounter).padStart(3, '0');
    return `BED-${counter}`;
  };

  const handleBedSubmit = async () => {
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
    // Auto-generate bedId if not manually specified
    /* const generatedId = await getNextBedId(floorKey);
    if (!generatedId) {
      setLoading(false);
      return;
    }
    bedId = generatedId; */
    const payload = {
      bedId,
      bedType: type.toLowerCase(),
      floor: floorKey,
    };
    try {
      const result = await ApiManager.createBed(payload);
      onSuccess(result);
      onClose();
      setType(bedTypes[0]);
      setBedFloor(floor || floors[0]);
      setBedCounter(getCounterRange(floorMap[floor || floors[0]]).min);
    } catch (e: any) {
      setError(e.message || 'Error adding bed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Bed</DialogTitle>
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
          {loading ? 'Adding...' : 'Add Bed'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
