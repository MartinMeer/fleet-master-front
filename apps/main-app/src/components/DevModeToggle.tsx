// apps/main-app/src/components/DevModeToggle.tsx
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Settings, Database, HardDrive } from 'lucide-react';
import { ConfigService } from '../services/ConfigService';

/**
 * Development mode toggle component
 * Provides a simple popup interface to switch between localStorage and backend modes
 * Only visible in development mode
 */
export const DevModeToggle = () => {
  const [isUsingBackend, setIsUsingBackend] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Only show in development mode
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  useEffect(() => {
    setIsUsingBackend(ConfigService.shouldUseBackend());
  }, []);

  const handleToggle = (checked: boolean) => {
    ConfigService.setBackendOverride(checked);
    setIsUsingBackend(checked);
    
    // Show a brief loading state then reload
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const getCurrentModeInfo = () => {
    return isUsingBackend 
      ? { label: 'Backend API', icon: Database, variant: 'default' as const }
      : { label: 'localStorage', icon: HardDrive, variant: 'secondary' as const };
  };

  const modeInfo = getCurrentModeInfo();
  const ModeIcon = modeInfo.icon;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-primary hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs"
          aria-label="Development mode settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Development Mode</h4>
            <p className="text-sm text-muted-foreground">
              Switch between data storage modes for testing
            </p>
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-2">
              <ModeIcon className="h-4 w-4" />
              <Label htmlFor="backend-mode" className="text-sm font-medium">
                Use Backend API
              </Label>
            </div>
            <Switch
              id="backend-mode"
              checked={isUsingBackend}
              onCheckedChange={handleToggle}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current mode:</span>
            <Badge variant={modeInfo.variant} className="text-xs">
              {modeInfo.label}
            </Badge>
          </div>

          <div className="pt-2 border-t">
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>localStorage:</strong> Data stored locally, no server needed</p>
              <p><strong>Backend API:</strong> Data fetched from configured API server</p>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
