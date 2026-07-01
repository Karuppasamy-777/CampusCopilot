import * as React from "react";
import { Search } from "lucide-react";
import { Input, InputProps } from "./input";
import { cn } from "@/lib/utils";

export interface SearchBarProps extends InputProps {
  onSearch?: (value: string) => void;
}

export function SearchBar({ className, onSearch, onChange, ref, ...props }: SearchBarProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(e);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <div className={cn("relative flex w-full items-center", className)}>
      <Search className="absolute left-3 h-4 w-4 text-zinc-400 pointer-events-none" />
      <Input
        ref={ref}
        type="search"
        onChange={handleChange}
        className="pl-9 pr-4"
        {...props}
      />
    </div>
  );
}

export default SearchBar;
