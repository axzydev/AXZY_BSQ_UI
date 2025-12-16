import { get } from "@app/core/axios/axios";
import { TResult } from "@app/core/types/TResult";

export interface PaymentSummary {
  coachId: number;
  coachName: string;
  completedClasses: number;
  totalAmount: number;
  details: {
    date: string;
    mode: string;
    cost: number;
  }[];
}

export const getCoachPayments = async (startDate: string, endDate: string, coachId?: number): Promise<TResult<PaymentSummary[]>> => {
  const params = new URLSearchParams();
  params.append("startDate", startDate);
  params.append("endDate", endDate);
  if (coachId) params.append("coachId", coachId.toString());

  return await get<PaymentSummary[]>(`/payments/coaches?${params.toString()}`);
};
