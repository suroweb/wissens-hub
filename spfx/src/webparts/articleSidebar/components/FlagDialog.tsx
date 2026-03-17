import * as React from 'react';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react/lib/Dialog';
import { TextField } from '@fluentui/react/lib/TextField';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { useFlagArticleCommand } from '../../../shared/hooks/commands';
import * as strings from 'ArticleSidebarWebPartStrings';
import * as sharedStrings from 'SharedStrings';

export interface IFlagDialogProps {
  isOpen: boolean;
  pageId: number;
  onDismiss: () => void;
  onFlagSubmitted: (flagDate: Date) => void;
}

export const FlagDialog: React.FC<IFlagDialogProps> = ({
  isOpen,
  pageId,
  onDismiss,
  onFlagSubmitted,
}) => {
  const [reason, setReason] = React.useState<string>('');
  const flagArticle = useFlagArticleCommand();

  const dialogContentProps = {
    type: DialogType.normal,
    title: strings.FlagDialogTitle,
    subText: strings.FlagDialogSubText,
  };

  const handleSubmit = React.useCallback(async () => {
    const success = await flagArticle.execute(pageId, reason);
    if (success) {
      onFlagSubmitted(new Date());
      setReason('');
    }
  }, [pageId, reason, flagArticle, onFlagSubmitted]);

  const handleDismiss = React.useCallback(() => {
    setReason('');
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
        label={strings.ReasonLabel}
        multiline
        rows={3}
        required
        value={reason}
        onChange={(_, v) => setReason(v || '')}
      />
      <DialogFooter>
        <PrimaryButton
          text={sharedStrings.Submit}
          onClick={handleSubmit}
          disabled={!reason.trim() || flagArticle.state.status === 'executing'}
        />
        <DefaultButton text={sharedStrings.Cancel} onClick={handleDismiss} />
      </DialogFooter>
    </Dialog>
  );
};
