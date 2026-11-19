export type Screen = 'splash' | 'cuentas' | 'calculadora' | 'notas' | 'historial';

export interface AccountItem {
  id: string;
  description: string;
  value: number | string;
}

export interface AccountData {
  clientName: string;
  address: string;
  neighborhood: string;
  phone: string;
  city: string;
  items: AccountItem[];
  withDiscount: boolean;
  additionalNotes: string;
}
