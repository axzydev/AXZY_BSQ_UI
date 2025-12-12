import { get, post, put, remove } from "@app/core/axios/axios";
import { TResult } from "@app/core/types/TResult";

export const getAllDaySchedules = async (): Promise<TResult<any[]>> => {
  return await get("/day-schedule");
};

export const getDayScheduleById = async (
  id: number
): Promise<TResult<any>> => {
  return await get(`/day-schedule/${id}`);
};

export const createDaySchedule = async (
  data: any
): Promise<TResult<any>> => {
  return await post("/day-schedule", data);
};

export const updateDaySchedule = async (
  id: number,
  data: any
): Promise<TResult<any>> => {
  return await put(`/day-schedule/${id}`, data);
};

export const deleteDaySchedule = async (
  id: number
): Promise<TResult<any>> => {
  return await remove(`/day-schedule/${id}`);
};
