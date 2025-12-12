import { get, post, put, remove } from "@app/core/axios/axios";
import { TResult } from "@app/core/types/TResult";

export const getAllTrainingModes = async (): Promise<TResult<any[]>> => {
  return await get("/training-modes");
};
export const getTrainingModeById = async (
  id: string
): Promise<TResult<any>> => {
  return await get(`/training-modes/${id}`);
};
export const createTrainingMode = async (data: any): Promise<TResult<any>> => {
  return await post("/training-modes", data);
};
export const updateTrainingMode = async (
  id: string,
  data: any
): Promise<TResult<any>> => {
  return await put(`/training-modes/${id}`, data);
};

export const deleteTrainingMode = async (
  id: string
): Promise<TResult<null>> => {
  return await remove(`/training-modes/${id}`);
};
