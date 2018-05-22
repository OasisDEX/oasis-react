import { createNumberMask } from "redux-form-input-masks";

export const amountMask = createNumberMask({ decimalPlaces: 5, locale: 'en' });