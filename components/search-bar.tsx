import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  className?: string;
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar = ({ className, value, onChange }: SearchBarProps) => (
  <div className={`${className}`}>
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 bg-secondary/50"
      />
    </div>
  </div>
);
