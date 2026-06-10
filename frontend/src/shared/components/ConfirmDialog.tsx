'use client';

import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button disabled={loading} onClick={onClose} variant="outlined">
          {cancelText}
        </Button>

        <Button disabled={loading} onClick={onConfirm} variant="contained" color="error">
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
