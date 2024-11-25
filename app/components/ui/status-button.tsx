import * as React from "react";
import { Button, ButtonProps } from "./button";
import { LoaderCircle } from "lucide-react";

interface StatusButonProps extends ButtonProps {
  status: "idle" | "pending";
  children: React.ReactNode;
}

export const StatusButton: React.FC<StatusButonProps> = ({
  status = "idle",
  children,
  ...props
}) => {
  const companion = {
    pending: (
      <span className="inline-block animate-spin">
        <LoaderCircle />
      </span>
    ),
    idle: null,
  }[status];
  return (
    <Button {...props}>
      {children} {companion}
    </Button>
  );
};
