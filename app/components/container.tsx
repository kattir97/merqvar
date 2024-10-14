import React from "react";

interface ContainerProps {
  children: React.ReactNode;
}

export const Container = ({ children }: ContainerProps): JSX.Element => {
  return <div className="flex flex-col max-w-5xl mt-10 mx-auto">{children}</div>;
};
