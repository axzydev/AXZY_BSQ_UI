import { get } from "../axios/axios";
import { CatalogOptionsType } from "../types/catalog.types";
import { TResult } from "../types/TResult";

export const getCatalogOptions = async (
  catalog: CatalogOptionsType
): Promise<TResult<any>> => {
  return await get<any>(`/catalog/${catalog}`);
};

export const getCatalogBusinessLineServiceOptions = async (
  id: number
): Promise<TResult<any>> => {
  return await get<any>(`/Catalog/ByBusinessLine/${id}`);
};

export const getCatalogOptionsById = async (
  catalog: CatalogOptionsType,
  id: number
): Promise<TResult<any>> => {
  return await get<any>(`/Catalog/${catalog}/${id}`);
};

export const getActiveProjectsByCustomerId = async(
  catalog: CatalogOptionsType,
  id: number
): Promise<TResult<any>> => {
  return await get<any>(`/Catalog/${catalog}?customerId=${id}`)
}

export const getActiveRfcByCustomerId = async (
  customerId: number
): Promise<TResult<any>> => {
  return await get<any>(`/Catalog/ActiveRfc/${customerId}`);
};
