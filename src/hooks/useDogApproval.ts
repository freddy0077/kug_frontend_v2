import { useMutation } from '@apollo/client';
import { APPROVE_DOG_MUTATION, DECLINE_DOG_MUTATION } from '@/graphql/mutations/dogMutations';
import { ApprovalStatus } from '@/types/enums';
import { toast } from 'react-hot-toast';

interface DogApprovalResult {
  id: string;
  name: string;
  approvalStatus: ApprovalStatus;
  approvalDate: string;
  approvalNotes?: string;
  approvedBy?: {
    id: string;
    fullName: string;
  };
}

interface UseDogApprovalProps {
  onSuccess?: (result: DogApprovalResult) => void;
  refetchQueries?: string[];
}

export const useDogApproval = ({ onSuccess, refetchQueries = ['GetDogs'] }: UseDogApprovalProps = {}) => {
  // Approve dog mutation
  const [approveDog, { loading: approveLoading }] = useMutation(APPROVE_DOG_MUTATION, {
    onCompleted: (data) => {
      if (data?.approveDog) {
        toast.success(`${data.approveDog.name} has been approved`);
        onSuccess?.(data.approveDog);
      }
    },
    onError: (error) => {
      toast.error(`Error approving dog: ${error.message}`);
    },
    refetchQueries,
  });

  // Decline dog mutation
  const [declineDog, { loading: declineLoading }] = useMutation(DECLINE_DOG_MUTATION, {
    onCompleted: (data) => {
      if (data?.declineDog) {
        toast.success(`${data.declineDog.name} has been declined`);
        onSuccess?.(data.declineDog);
      }
    },
    onError: (error) => {
      toast.error(`Error declining dog: ${error.message}`);
    },
    refetchQueries,
  });

  const handleApproveDog = async (id: string, notes?: string) => {
    try {
      await approveDog({
        variables: {
          id,
          notes,
        },
      });
    } catch (error) {
      console.error('Error approving dog:', error);
    }
  };

  const handleDeclineDog = async (id: string, notes?: string) => {
    try {
      await declineDog({
        variables: {
          id,
          notes,
        },
      });
    } catch (error) {
      console.error('Error declining dog:', error);
    }
  };

  return {
    approveDog: handleApproveDog,
    declineDog: handleDeclineDog,
    approveLoading,
    declineLoading,
    loading: approveLoading || declineLoading,
  };
};
