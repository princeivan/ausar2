import React from "react";
import { Button } from "../../components/ui/button";
import { PlusCircle } from "lucide-react";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actionLabel && (
        <Button onClick={onAction} className="mt-4 md:mt-0">
          <PlusCircle className="mr-2 h-4 w-4" /> {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default AdminPageHeader;
