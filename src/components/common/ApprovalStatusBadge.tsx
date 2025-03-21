'use client';

import { ApprovalStatus } from '@/types/enums';
import { Tooltip } from '@material-tailwind/react';
import { format } from 'date-fns';

interface ApprovalStatusBadgeProps {
  status: ApprovalStatus;
  approvalDate?: string | null;
  approvedBy?: {
    id: string;
    fullName: string;
  } | null;
  notes?: string | null;
  className?: string;
  showTooltip?: boolean;
}

const ApprovalStatusBadge: React.FC<ApprovalStatusBadgeProps> = ({
  status,
  approvalDate,
  approvedBy,
  notes,
  className = '',
  showTooltip = true,
}) => {
  const getBadgeStyles = () => {
    switch (status) {
      case ApprovalStatus.APPROVED:
        return 'bg-green-100 text-green-800 border-green-200';
      case ApprovalStatus.DECLINED:
        return 'bg-red-100 text-red-800 border-red-200';
      case ApprovalStatus.PENDING:
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const badge = (
    <span
      className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${getBadgeStyles()} ${className}`}
    >
      {status}
    </span>
  );

  if (!showTooltip || status === ApprovalStatus.PENDING) {
    return badge;
  }

  // Format approval details for tooltip
  const tooltipContent = () => {
    const formattedDate = approvalDate 
      ? format(new Date(approvalDate), 'MMM d, yyyy h:mm a')
      : 'Unknown date';
    
    return (
      <div className="p-2 max-w-xs">
        <p className="font-medium mb-1">{status} on {formattedDate}</p>
        {approvedBy && <p className="text-sm mb-1">By: {approvedBy.fullName}</p>}
        {notes && <p className="text-sm italic">&quot;{notes}&quot;</p>}
      </div>
    );
  };

  return (
    <Tooltip content={tooltipContent()}>
      {badge}
    </Tooltip>
  );
};

export default ApprovalStatusBadge;
