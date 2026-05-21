import type { BasicInfoValues } from "../components/builder/basic-info-form";
import { saveServicePageApi } from "./service-page-api";

/** @deprecated Use saveServicePageApi with sections payload */
export const basicFormApi = (values: BasicInfoValues, id?: number) =>
  saveServicePageApi(values, {}, id);
