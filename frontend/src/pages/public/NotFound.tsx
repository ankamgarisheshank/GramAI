import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { MapPinOff } from 'lucide-react';

export const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
      <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mb-8">
        <MapPinOff className="h-12 w-12 text-muted-foreground" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight mb-4">404 - Page Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        We couldn't find the page you're looking for. It might have been moved, deleted, or perhaps you typed the URL incorrectly.
      </p>
      <div className="flex space-x-4">
        <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
        <Button onClick={() => navigate('/')}>Return Home</Button>
      </div>
    </div>
  );
};
