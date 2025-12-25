import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DialogClose } from "@/components/ui/dialog";
import { X } from "lucide-react";

export function Header({ activeSection }: { activeSection: string }) {
  return (
    <header className="h-10 shrink-0 flex items-center px-4 border-b">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:block">
            <BreadcrumbLink href="#">Settings</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>{activeSection}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <DialogClose className="ml-auto text-muted-foreground hover:text-foreground">
        <X className="size-5" />
      </DialogClose>
    </header>
  );
}
