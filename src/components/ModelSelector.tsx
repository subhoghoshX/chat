import { CheckIcon, ChevronsUpDownIcon, SearchIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { type Model, supportedModels } from "../../utils/supported-models";
import { useConvexAuth } from "convex/react";
import { Input } from "@base-ui/react/input";

interface Props {
  selectedModel: Model;
  onChange: (model: Model) => void;
  className?: string;
}

export default function ModelSelector({ className, selectedModel, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const auth = useConvexAuth();
  const filteredModels = useMemo(
    () => supportedModels.filter((model) => model.label.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setQuery("");
        }
      }}
    >
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("justify-between", className)}
            size="sm"
          >
            {supportedModels.find((model) => model.name === selectedModel)?.label}
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        }
      />
      <PopoverContent className="w-[200px] p-0">
        <div className="flex h-10 items-center gap-2 border-b px-3">
          <SearchIcon className="text-muted-foreground size-4 shrink-0" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search model..."
            className="placeholder:text-muted-foreground h-full min-w-0 flex-1 bg-transparent text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div className="p-1">
          {filteredModels.length === 0 && <div className="py-6 text-center text-sm">No model found.</div>}
          {filteredModels.map((model) => {
            const disabled = !auth.isAuthenticated && model.for === "AUTHENTICATED";

            return (
              <button
                disabled={disabled}
                key={model.name}
                onClick={() => {
                  onChange(model.name);
                  setOpen(false);
                }}
                className="hover:bg-accent hover:text-accent-foreground flex w-full cursor-default items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-hidden disabled:pointer-events-none disabled:opacity-50"
              >
                {model.label}
                <CheckIcon className={cn("mr-2 h-4 w-4", selectedModel === model.name ? "opacity-100" : "opacity-0")} />
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
