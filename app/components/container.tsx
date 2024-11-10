import React from "react";

interface ContainerProps {
  children: React.ReactNode;
  maxWidth?: "max-w-xl" | "max-w-2xl" | "max-w-3xl" | "max-w-4xl" | "max-w-5xl";
}

export const Container = ({ children, maxWidth = "max-w-5xl" }: ContainerProps): JSX.Element => {
  return <div className={`flex flex-col ${maxWidth} mt-10 mx-auto h-full`}>{children}</div>;
};
