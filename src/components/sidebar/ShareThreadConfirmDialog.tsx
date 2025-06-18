import { useState } from "react";
import { Button } from "../ui/button";
import { LoaderCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onGenerateBtnClick: () => Promise<string>;
}

export default function ShareThreadConfirmDialog({ isOpen, setIsOpen, onGenerateBtnClick }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopiedToClipboard, setIsCopiedToClipboard] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-128">
        <DialogHeader>
          <DialogTitle>Do you want to make this thread public?</DialogTitle>
          <DialogDescription>Anyone with the link will be able to see the messages in the thread.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            className="w-full"
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
