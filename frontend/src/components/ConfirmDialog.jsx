import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          pb: 1,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(239, 68, 68, 0.15)',
          }}
        >
          <WarningAmberRoundedIcon sx={{ color: 'error.main', fontSize: 22 }} />
        </Box>
        {title || 'Confirm Action'}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: 'text.secondary' }}>
          {message || 'Are you sure you want to proceed? This action cannot be undone.'}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          sx={{
            borderColor: 'rgba(255,255,255,0.12)',
            color: 'text.secondary',
            '&:hover': {
              borderColor: 'rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.04)',
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          sx={{
            boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(239, 68, 68, 0.6)',
            },
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
