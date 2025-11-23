import React from 'react';

interface ViewWrapperProps {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}

const ViewWrapper: React.FC<ViewWrapperProps> = ({ children }) => {
  // The title and onBack props are handled globally by MainHeader in App.tsx.
  // This component provides a consistent container for page content.
  return <div className="animate-fade-in h-full flex flex-col">{children}</div>;
};

export default ViewWrapper;
