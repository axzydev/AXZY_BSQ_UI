import { get } from "@app/core/axios/axios";
import { TResult } from "@app/core/types/TResult";

export interface User {
  id: number;
  name: string;
  lastName: string;
  email: string;
  role: string;
}

export const getCoaches = async (): Promise<TResult<User[]>> => {
  return await get<User[]>("/users/coaches");
};
