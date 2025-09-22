import * as React from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export interface SelectTriggerProps {
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

export interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

// Context for Select state
const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disabled?: boolean;
}>({
  open: false,
  onOpenChange: () => {},
});

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ value, onValueChange, children, disabled }, ref) => {
    const [open, setOpen] = React.useState(false);

    return (
      <SelectContext.Provider
        value={{
          value,
          onValueChange,
          open,
          onOpenChange: setOpen,
          disabled,
        }}
      >
        <div ref={ref} className="relative">
          {children}
        </div>
      </SelectContext.Provider>
    );
  }
);
Select.displayName = "Select";

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, disabled, ...props }, ref) => {
    const { open, onOpenChange, disabled: contextDisabled } = React.useContext(SelectContext);
    const isDisabled = disabled || contextDisabled;

    return (
      <button
        ref={ref}
        type="button"
        disabled={isDisabled}
        aria-expanded={open}
        onClick={() => !isDisabled && onOpenChange(!open)}
        className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
          className || ""
        }`}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ placeholder, className, ...props }, ref) => {
    const { value } = React.useContext(SelectContext);
    const selectContent = React.useContext(SelectContentContext);

    const displayValue = React.useMemo(() => {
      if (!value || !selectContent.items) return placeholder;
      const item = selectContent.items.find(item => item.value === value);
      return item ? item.children : placeholder;
    }, [value, selectContent.items, placeholder]);

    return (
      <span
        ref={ref}
        className={`block truncate ${!value ? "text-gray-500" : ""} ${className || ""}`}
        {...props}
      >
        {displayValue}
      </span>
    );
  }
);
SelectValue.displayName = "SelectValue";

// Context for collecting items
const SelectContentContext = React.createContext<{
  items: Array<{ value: string; children: React.ReactNode }>;
  setItems: React.Dispatch<React.SetStateAction<Array<{ value: string; children: React.ReactNode }>>>;
}>({
  items: [],
  setItems: () => {},
});

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ children, className, ...props }, ref) => {
    const { open, onOpenChange } = React.useContext(SelectContext);
    const [items, setItems] = React.useState<Array<{ value: string; children: React.ReactNode }>>([]);

    if (!open) return null;

    return (
      <SelectContentContext.Provider value={{ items, setItems }}>
        <div
          ref={ref}
          className={`absolute top-full z-50 mt-1 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white text-gray-900 shadow-md ${
            className || ""
          }`}
          {...props}
        >
          <div className="p-1">
            {children}
          </div>
        </div>
      </SelectContentContext.Provider>
    );
  }
);
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value, ...props }, ref) => {
    const { value: selectedValue, onValueChange, onOpenChange } = React.useContext(SelectContext);
    const { setItems } = React.useContext(SelectContentContext);
    const isSelected = selectedValue === value;

    // Register this item with the content
    React.useEffect(() => {
      setItems(prev => {
        const existing = prev.find(item => item.value === value);
        if (existing) return prev;
        return [...prev, { value, children }];
      });
    }, [value, children, setItems]);

    const handleSelect = () => {
      onValueChange?.(value);
      onOpenChange(false);
    };

    return (
      <div
        ref={ref}
        role="option"
        aria-selected={isSelected}
        data-state={isSelected ? "checked" : "unchecked"}
        className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 data-[state=checked]:bg-gray-100 ${
          className || ""
        }`}
        onClick={handleSelect}
        {...props}
      >
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {isSelected && <Check className="h-4 w-4" />}
        </span>
        <span className={`pl-6`}>{children}</span>
      </div>
    );
  }
);
SelectItem.displayName = "SelectItem";

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
};