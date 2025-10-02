'use client';

import * as React from 'react';

import { Search } from 'lucide-react';

import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { type DialogProps } from '@radix-ui/react-dialog';

interface CommandContextValue {
  query: string;
  setQuery: (value: string) => void;
}

const CommandContext = React.createContext<CommandContextValue | null>(null);

const useCommandContext = () => {
  const context = React.useContext(CommandContext);
  if (!context) {
    throw new Error('Command components must be used within <Command>.');
  }
  return context;
};

interface CommandListContextValue {
  registerItem: (id: string, visible: boolean) => void;
  setItemVisibility: (id: string, visible: boolean) => void;
  unregisterItem: (id: string) => void;
  visibleCount: number;
}

const CommandListContext = React.createContext<CommandListContextValue | null>(null);

const useCommandListContext = () => React.useContext(CommandListContext);

type CommandProps = React.HTMLAttributes<HTMLDivElement> & {
  onQueryChange?: (value: string) => void;
};

const Command = React.forwardRef<HTMLDivElement, CommandProps>(
  ({ className, children, onQueryChange, ...props }, ref) => {
    const [query, setQuery] = React.useState('');

    const handleSetQuery = React.useCallback(
      (value: string) => {
        setQuery(value);
        onQueryChange?.(value);
      },
      [onQueryChange]
    );

    return (
      <CommandContext.Provider value={{ query, setQuery: handleSetQuery }}>
        <div
          ref={ref}
          className={cn(
            'flex flex-col bg-popover rounded-md w-full h-full overflow-hidden text-popover-foreground',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </CommandContext.Provider>
    );
  }
);
Command.displayName = 'Command';

interface CommandDialogProps extends DialogProps {}

const CommandDialog = ({ children, ...props }: CommandDialogProps) => (
  <Dialog {...props}>
    <DialogContent className="shadow-lg p-0 overflow-hidden">
      <Command>{children}</Command>
    </DialogContent>
  </Dialog>
);

type CommandInputProps = React.InputHTMLAttributes<HTMLInputElement>;

const CommandInput = React.forwardRef<HTMLInputElement, CommandInputProps>(
  ({ className, onChange, ...props }, ref) => {
    const { setQuery } = useCommandContext();

    const handleChange = React.useCallback<
      NonNullable<CommandInputProps['onChange']>
    >(
      (event) => {
        setQuery(event.target.value);
        onChange?.(event);
      },
      [onChange, setQuery]
    );

    return (
      <div className="flex items-center px-3 border-b">
        <Search className="opacity-50 mr-2 w-4 h-4 shrink-0" />
        <input
          ref={ref}
          className={cn(
            'flex bg-transparent disabled:opacity-50 py-3 rounded-md outline-none w-full h-11 placeholder:text-muted-foreground text-sm disabled:cursor-not-allowed',
            className
          )}
          onChange={handleChange}
          {...props}
        />
      </div>
    );
  }
);
CommandInput.displayName = 'CommandInput';

type CommandListProps = React.HTMLAttributes<HTMLDivElement>;

const CommandList = React.forwardRef<HTMLDivElement, CommandListProps>(
  ({ className, children, ...props }, ref) => {
    const [visibilityMap, setVisibilityMap] = React.useState<Record<string, boolean>>({});

    const registerItem = React.useCallback<CommandListContextValue['registerItem']>((id, visible) => {
      setVisibilityMap((prev) => {
        if (prev[id] === visible) return prev;
        return { ...prev, [id]: visible };
      });
    }, []);

    const setItemVisibility = React.useCallback<CommandListContextValue['setItemVisibility']>((id, visible) => {
      setVisibilityMap((prev) => {
        if (prev[id] === visible) return prev;
        return { ...prev, [id]: visible };
      });
    }, []);

    const unregisterItem = React.useCallback<CommandListContextValue['unregisterItem']>((id) => {
      setVisibilityMap((prev) => {
        if (!(id in prev)) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, []);

    const visibleCount = React.useMemo(
      () => Object.values(visibilityMap).filter(Boolean).length,
      [visibilityMap]
    );

    const contextValue = React.useMemo<CommandListContextValue>(
      () => ({ registerItem, setItemVisibility, unregisterItem, visibleCount }),
      [registerItem, setItemVisibility, unregisterItem, visibleCount]
    );

    return (
      <CommandListContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn('py-2 max-h-[300px] overflow-x-hidden overflow-y-auto', className)}
          {...props}
        >
          {children}
        </div>
      </CommandListContext.Provider>
    );
  }
);
CommandList.displayName = 'CommandList';

type CommandEmptyProps = React.HTMLAttributes<HTMLDivElement>;

const CommandEmpty = React.forwardRef<HTMLDivElement, CommandEmptyProps>(
  ({ className, children, ...props }, ref) => {
    const listContext = useCommandListContext();

    if (listContext && listContext.visibleCount > 0) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn('py-6 text-muted-foreground text-sm text-center', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CommandEmpty.displayName = 'CommandEmpty';

interface CommandGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  heading?: React.ReactNode;
}

const CommandGroup = React.forwardRef<HTMLDivElement, CommandGroupProps>(
  ({ className, heading, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('space-y-1 p-1 text-foreground', className)}
      {...props}
    >
      {heading ? (
        <p className="px-2 py-1.5 font-medium text-muted-foreground text-xs">
          {heading}
        </p>
      ) : null}
      <div className="space-y-1">{children}</div>
    </div>
  )
);
CommandGroup.displayName = 'CommandGroup';

type CommandSeparatorProps = React.HTMLAttributes<HTMLDivElement>;

const CommandSeparator = React.forwardRef<HTMLDivElement, CommandSeparatorProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('my-1 bg-border h-px', className)}
      {...props}
    />
  )
);
CommandSeparator.displayName = 'CommandSeparator';

interface CommandItemProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onSelect'> {
  value?: string;
  keywords?: string[];
  onSelect?: (value: string) => void;
}

const CommandItem = React.forwardRef<HTMLButtonElement, CommandItemProps>(
  ({ className, value, keywords = [], children, onSelect, onClick, ...props }, ref) => {
    const { query } = useCommandContext();
    const listContext = useCommandListContext();
    const id = React.useId();

    const stringContent = React.useMemo(() => {
      if (value) return value;
      if (typeof children === 'string') return children;
      return React.Children.toArray(children)
        .filter((child) => typeof child === 'string')
        .join(' ');
    }, [children, value]);

    const haystack = React.useMemo(() => {
      const base = stringContent ?? '';
      return [base, ...keywords].join(' ').toLowerCase();
    }, [keywords, stringContent]);

    const needle = query.trim().toLowerCase();
    const isVisible = needle.length === 0 || haystack.includes(needle);

    React.useEffect(() => {
      if (!listContext) return;
      listContext.registerItem(id, isVisible);
      return () => listContext.unregisterItem(id);
    }, [id, isVisible, listContext]);

    React.useEffect(() => {
      if (!listContext) return;
      listContext.setItemVisibility(id, isVisible);
    }, [id, isVisible, listContext]);

    if (!isVisible) {
      return null;
    }

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) {
        onSelect?.(stringContent ?? '');
      }
    };

    return (
      <button
        type="button"
        ref={ref}
        data-value={stringContent ?? ''}
        className={cn(
          'relative flex items-center hover:bg-accent focus:bg-accent px-2 py-1.5 rounded-sm outline-none w-full text-sm text-left transition hover:text-accent-foreground focus:text-accent-foreground cursor-pointer select-none',
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);
CommandItem.displayName = 'CommandItem';

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn('ml-auto text-muted-foreground text-xs tracking-widest', className)}
    {...props}
  />
);
CommandShortcut.displayName = 'CommandShortcut';

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
};
