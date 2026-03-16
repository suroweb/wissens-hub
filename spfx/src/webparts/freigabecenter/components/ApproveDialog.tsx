import * as React from 'react';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react/lib/Dialog';
import { TextField } from '@fluentui/react/lib/TextField';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';

export interface IApproveDialogProps {
  isOpen: boolean;
  pageId: number;
  articleTitle: string;
  onDismiss: () => void;
  onApproved: (comment?: string) => void;
}

export const ApproveDialog: React.FC<IApproveDialogProps> = ({
  isOpen,
  pageId,
  articleTitle,
  onDismiss,
  onApproved,
}) => {
  const [comment, setComment] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  // pageId used to reset state when target changes
  React.useEffect(() => {
    setComment('');
    setIsSubmitting(false);
  }, [pageId, isOpen]);

  const dialogContentProps = React.useMemo(() => ({
    type: DialogType.normal,
    title: 'Artikel genehmigen',
    subText: articleTitle,
  }), [articleTitle]);

  const handleSubmit = React.useCallback((): void => {
    setIsSubmitting(true);
    onApproved(comment.trim() || undefined);
  }, [comment, onApproved]);

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
        label="Kommentar"
        multiline
        rows={3}
        value={comment}
        onChange={(_, v) => setComment(v || '')}
      />
      <DialogFooter>
        <PrimaryButton
          text="Genehmigen"
          onClick={handleSubmit}
          disabled={isSubmitting}
        />
        <DefaultButton text="Abbrechen" onClick={handleDismiss} />
      </DialogFooter>
    </Dialog>
  );
};
