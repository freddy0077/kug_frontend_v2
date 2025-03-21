declare module '@material-tailwind/react' {
  export interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactElement;
    placement?: 'top' | 'top-start' | 'top-end' | 'right' | 'right-start' | 'right-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end';
    offset?: number;
    animate?: {
      mount?: object;
      unmount?: object;
    };
    className?: string;
    open?: boolean;
    handler?: () => void;
  }

  export const Tooltip: React.FC<TooltipProps>;
}
