import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useSchemes } from '../../hooks/useSchemes';
import { Skeleton } from '../../components/ui/Skeleton';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/Alert';
import { Link } from 'react-router-dom';

export const CitizenSchemes = () => {
  // Using 'all' to show a comprehensive list, could be tailored further.
  const { data: schemes, isLoading, isError } = useSchemes('all');

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold">Government Schemes</h1>
      <p className="text-muted-foreground mb-6">Browse and apply for schemes you may be eligible for.</p>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Available Schemes</CardTitle>
        </CardHeader>
        <CardContent>
          {isError ? (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Failed to load schemes. Please try again later.</AlertDescription>
            </Alert>
          ) : isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          ) : schemes && schemes.length > 0 ? (
            <div className="space-y-4">
              {schemes.map((scheme: any) => (
                <div key={scheme.id} className="p-4 rounded-xl bg-muted/30 border border-border flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">{scheme.name}</h3>
                    <p className="text-muted-foreground text-sm mt-1">{scheme.description}</p>
                    <div className="mt-3 flex gap-2">
                      <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-md">
                        {scheme.department}
                      </span>
                      {scheme.beneficiary_type && (
                         <span className="text-xs font-medium bg-muted text-muted-foreground px-2 py-1 rounded-md">
                          {scheme.beneficiary_type}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex md:items-center">
                    <Link to={`/dashboard/schemes/${scheme.id}`} className="whitespace-nowrap px-4 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No schemes found at this time.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
