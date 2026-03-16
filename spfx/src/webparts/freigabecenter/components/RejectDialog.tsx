import * as React from 'react';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react/lib/Dialog';
import { TextField } from '@fluentui/react/lib/TextField';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';

export interface IRejectDialogProps {
  isOpen: boolean;
  pageId: number;
  articleTitle: string;
  onDismiss: () => void;
  onRejected: (comment: string) => void;
}

export const RejectDialog: React.FC<IRejectDialogProps> = ({
  isOpen,
  pageId,
  articleTitle,
  onDismiss,
  onRejected,
}) => {
  const [comment, setComment] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  // Reset state when target changes
  React.useEffect(() => {
    setComment('');
    setIsSubmitting(false);
  }, [pageId, isOpen]);

  const dialogContentProps = React.useMemo(() => ({
    type: DialogType.normal,
    title: 'Artikel ablehnen',
    subText: articleTitle,
  }), [articleTitle]);

  const handleSubmit = React.useCallback((): void => {
    setIsSubmitting(true);
    onRejected(comment);
  }, [comment, onRejected]);

  const handleDismiss = React.useCallback((): void => {
    setComment('');
    onDismiss();
  }, [onDismiss]);

  return (
    <Dialog
      hidden={!isOpen}
      onDismiss={handleDismiss}
      dialogContentProps={dialogContentProps}
      minWidth={400}
    >
      <TextField
        label="Begruendung"
        multiline
        rows={3}
        required
        value={comment}
        onChange={(_, v) => setComment(v || '')}
      />
      <DialogFooter>
        <PrimaryButton
          text="Ablehnen"
          onClick={handleSubmit}
          disabled={!comment.trim() || isSubmitting}
        />
        <DefaultButton text="Abbrechen" onClick={handleDismiss} />
      </DialogFooter>
    </Dialog>
  );
};
