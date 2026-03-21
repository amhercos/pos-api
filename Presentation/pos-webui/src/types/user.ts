export type UserRole = 'Admin' | 'StoreOwner' | 'Cashier';

export interface User  {
userName : string;
fullName : string;
role : UserRole 
token?: string;
storeId?: string;
}