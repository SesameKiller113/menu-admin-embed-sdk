import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import type { MenuItem } from "@menu-admin-embed-sdk/core";
import { Trash2, X } from "lucide-react";

type DeleteMenuItemDialogProps = {
  isDeleting: boolean;
  item: MenuItem | null;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteMenuItemDialog({
  isDeleting,
  item,
  onClose,
  onConfirm
}: DeleteMenuItemDialogProps) {
  return (
    <Dialog
      aria-describedby="delete-menu-item-description"
      aria-labelledby="delete-menu-item-title"
      onClose={onClose}
      open={Boolean(item)}
    >
      <DialogTitle id="delete-menu-item-title">Delete menu item?</DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-menu-item-description">
          This will remove {item?.name} from the menu.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          disabled={isDeleting}
          onClick={onClose}
          startIcon={<X size={18} />}
          type="button"
        >
          Cancel
        </Button>
        <Button
          color="error"
          disabled={isDeleting}
          onClick={onConfirm}
          startIcon={<Trash2 size={18} />}
          type="button"
          variant="contained"
        >
          {isDeleting ? "Deleting" : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
