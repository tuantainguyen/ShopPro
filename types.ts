
export interface InvoiceItem {
  id: string;
  productId?: string;
  description: string;
  quantity: number;
  price: number;
  costPrice: number; // Thêm giá vốn tại thời điểm bán
  unit?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
  createdAt: string;
}

export interface SellerProfile {
  businessName: string;
  taxCode: string;
  phone: string;
  email: string;
  address: string;
  website?: string;
}

export type UserRole = 'Admin' | 'Staff';

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Unit {
  id: string;
  name: string;
}

export interface StockEntry {
  id: string;
  productId: string;
  quantity: number;
  entryDate: string;
  supplier?: string;
  note?: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  unit: string;
  price: number;
  costPrice: number; // Thêm giá vốn sản phẩm
  initialStock: number; 
}

export type DocumentType = 'Invoice' | 'Quotation';

export interface Invoice {
  id: string;
  docType: DocumentType;
  invoiceNumber: string;
  date: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  items: InvoiceItem[];
  taxRate: number;
  notes: string;
  status: 'Draft' | 'Sent' | 'Paid';
}

export interface AppState {
  invoices: Invoice[];
  currentInvoice: Invoice;
  customers: Customer[];
  products: Product[];
  categories: Category[];
  units: Unit[];
  stockEntries: StockEntry[];
  sellerProfile: SellerProfile;
  users: UserAccount[];
}
