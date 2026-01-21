import { useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import ApiManager from "../services/apimanager";

export interface PatientOption {
  _id: string;
  firstName?: string;
  lastName?: string;
  opdId?: string;
  uhId?: string;
}

interface Props {
  initialOpd?: string;
  value?: PatientOption | null;
  onPatientSelect: (patient: PatientOption | null) => void;
  label?: string;
  disabled?: boolean;
}

const PatientSearchInput = ({ initialOpd = "", value = null, onPatientSelect, label = "OPD ID", disabled = false }: Props) => {
  const [inputValue, setInputValue] = useState(initialOpd || "");
  const [options, setOptions] = useState<PatientOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<PatientOption | null>(value || null);

  useEffect(() => {
    setSelected(value || null);

    if (value) {
      const id = (value as PatientOption).opdId || (value as PatientOption).uhId || (value as PatientOption)._id || "";
      setInputValue(id);
    } else {
      setInputValue(initialOpd || "");
    }

  }, [value, initialOpd]);

  useEffect(() => {
    const debounced = setTimeout(async () => {
      const q = (inputValue || "").trim();
      if (!q) {
        setOptions([]);
        return;
      }
      setLoading(true);
      try {
        const resp = await ApiManager.getPatients(1, 10, q);
        const rows = resp?.data?.data ?? [];
        setOptions(rows as PatientOption[]);
      } catch (err) {
        console.error("Error fetching patients for autocomplete:", err);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(debounced);
  }, [inputValue]);


  useEffect(() => {
    if (initialOpd !== undefined && initialOpd !== inputValue) setInputValue(initialOpd);
  }, [initialOpd]);

  const getLabel = (option: PatientOption) => {
    const id = option.opdId || option.uhId || option._id || "";
    const name = `${option.firstName || ""} ${option.lastName || ""}`.trim();
    return id ? `${id}${name ? ` - ${name}` : ""}` : name || "Unknown";
  };

  return (
    <Autocomplete
      onClose={async () => {

        if (!selected && inputValue.trim()) {
          try {
            const resp = await ApiManager.getPatients(1, 10, inputValue.trim());
            const rows = resp?.data?.data ?? [];
            const exact = rows.find((r: any) => r.opdId === inputValue.trim() || r._id === inputValue.trim() || r.uhId === inputValue.trim());
            if (exact) {
              setSelected(exact as PatientOption);
              onPatientSelect(exact as PatientOption);
              const id = exact.opdId || exact.uhId || exact._id || "";
              setInputValue(id);
            }
          } catch (err) {
            console.error("Error fetching exact patient on close:", err);
          }
        }
      }}
      disabled={disabled}
      freeSolo
      value={selected}
      options={options}
      getOptionLabel={(option) => (typeof option === "string" ? option : getLabel(option))}
      isOptionEqualToValue={(option, value) => option._id === value._id}
      onChange={(_, newValue) => {
        if (!newValue) {
          setSelected(null);
          onPatientSelect(null);
          return;
        }
        setSelected(newValue as PatientOption);
        onPatientSelect(newValue as PatientOption);
        const id = (newValue as PatientOption).opdId || (newValue as PatientOption).uhId || (newValue as PatientOption)._id || "";
        setInputValue(id);
      }}
      inputValue={inputValue}
      onInputChange={(_, newInput) => setInputValue(newInput)}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={label}
          size="small"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={18} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default PatientSearchInput;
