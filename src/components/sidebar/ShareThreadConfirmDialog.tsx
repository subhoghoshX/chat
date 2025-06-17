import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { LoaderCircle } from "lucide-react";

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onGenerateBtnClick: () => Promise<string>;
}

export default function ShareThreadConfirmDialog({ isOpen, setIsOpen, onGenerateBtnClick }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopiedToClipboard, setIsCopiedToClipboard] = useState(false);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Do you sure want to share this thread?</AlertDialogTitle>
          <AlertDialogDescription>
            Anyone with the link will be able to see the messages in the thread.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Button
          variant="outline"
          onClick={async () => {
            setIsGenerating(true);
            const _id = await onGenerateBtnClick();
            await navigator.clipboard.writeText(`${window.location.origin}/shared/${_id}`);
            setIsGenerating(false);
            setIsCopiedToClipboard(true);
            const id = setTimeout(() => {
              setIsCopiedToClipboard(false);
              clearTimeout(id);
            }, 1000);
          }}
        >
          {isGenerating && <LoaderCircle className="animate-spin" />}{" "}
          {!isCopiedToClipboard ? "Generate link" : "Copied to clipboard"}
        </Button>
      </AlertDialogContent>
    </AlertDialog>
  );
}
