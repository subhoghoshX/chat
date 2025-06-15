import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { type Model, supportedModels } from "../../utils/supported-models";
import { useConvexAuth } from "convex/react";

interface Props {
  selectedModel: Model;
  onChange: (model: Model) => void;
  className?: string;
}

export default function ModelSelector({ className, selectedModel, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const auth = useConvexAuth();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
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
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search model..." />
          <CommandList className="max-h-none">
            <CommandEmpty>No model found.</CommandEmpty>
            <CommandGroup>
              {supportedModels.map((model) => (
                <CommandItem
                  disabled={!auth.isAuthenticated && model.for === "AUTHENTICATED"}
                  key={model.name}
                  value={model.name}
                  onSelect={(currentValue) => {
                    onChange(currentValue as Model);
                    setOpen(false);
                  }}
                  className="justify-between"
                >
                  {model.label}
                  <CheckIcon
                    className={cn("mr-2 h-4 w-4", selectedModel === model.name ? "opacity-100" : "opacity-0")}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
