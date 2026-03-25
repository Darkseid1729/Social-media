import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { TRANSLATION_LANGUAGE_OPTIONS } from "../../utils/translation";

const TranslateMessageDialog = ({ open, onClose, language, onLanguageChange, onTranslate, disabled }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Translate Message</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
          Source language is detected automatically from your input text.
        </Typography>

        <FormControl fullWidth>
          <InputLabel id="translate-language-label">Target Language</InputLabel>
          <Select
            labelId="translate-language-label"
            value={language}
            label="Target Language"
            onChange={(e) => onLanguageChange(e.target.value)}
            disabled={disabled}
          >
            {TRANSLATION_LANGUAGE_OPTIONS.map((option) => (
              <MenuItem key={option.code} value={option.code}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={disabled}>Cancel</Button>
        <Button onClick={onTranslate} variant="contained" disabled={disabled}>
          {disabled ? "Translating..." : "Translate"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TranslateMessageDialog;
