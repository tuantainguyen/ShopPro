
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Invoice, InvoiceItem, Customer, Product, Category, Unit, DocumentType, StockEntry, SellerProfile, UserAccount } from './types';
import { Icons, CURRENCY } from './constants';
import InvoiceItemRow from './components/InvoiceItemRow';
import CustomerManagement from './components/CustomerManagement';
import ProductManagement from './components/ProductManagement';
import InventoryManagement from './components/InventoryManagement';
import OrderManagement from './components/OrderManagement';
import UserManagement from './components/UserManagement';
import Dashboard from './components/Dashboard';
import SellerProfileModal from './components/SellerProfileModal';
import InvoicePreview from './components/InvoicePreview';
import QRScanner from './components/QRScanner';
import Login from './components/Login';
import { parseItemsFromText, generateProfessionalNote } from './services/geminiService';
import { formatCurrency, formatDate } from './utils/formatters';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('mqb_session_user_data');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [activeTab, setActiveTab] = useState<'billing' | 'orders' | 'customers' | 'products' | 'inventory' | 'users' | 'dashboard'>('billing');
  
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('mqb_users');
    return saved ? JSON.parse(saved) : [];
  });

  const [sellerProfile, setSellerProfile] = useState<SellerProfile>(() => {
    const saved = localStorage.getItem('mqb_seller_profile');
    return saved ? JSON.parse(saved) : {
      businessName: 'My Shop Pro Store',
      taxCode: '',
      phone: '',
      email: '',
      address: 'Vui lòng cập nhật địa chỉ của bạn',
    };
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('mqb_customers');
    return saved ? JSON.parse(saved) : [];
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('mqb_categories');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Đồ uống' },
      { id: '2', name: 'Thức ăn' },
      { id: '3', name: 'Dịch vụ' }
    ];
  });

  const [units, setUnits] = useState<Unit[]>(() => {
    const saved = localStorage.getItem('mqb_units');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Cái' },
      { id: '2', name: 'Ly' },
      { id: '3', name: 'Kg' },
      { id: '4', name: 'Bộ' }
    ];
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('mqb_products');
    return saved ? JSON.parse(saved) : [];
  });

  const [stockEntries, setStockEntries] = useState<StockEntry[]>(() => {
    const saved = localStorage.getItem('mqb_stock_entries');
    return saved ? JSON.parse(saved) : [];
  });

  const [allInvoices, setAllInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('mqb_all_invoices');
    return saved ? JSON.parse(saved) : [];
  });

  const [invoice, setInvoice] = useState<Invoice>({
    id: '1',
    docType: 'Invoice',
    invoiceNumber: 'INV-' + Math.floor(1000 + Math.random() * 9000),
    date: new Date().toISOString().split('T')[0],
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    items: [],
    taxRate: 10,
    notes: '',
    status: 'Draft'
  });

  const [aiInput, setAiInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Theme configuration
  const docTheme = useMemo(() => {
    if (invoice.docType === 'Quotation') {
      return {
        primary: 'indigo',
        label: 'BÁO GIÁ',
        fullLabel: 'BÁO GIÁ SẢN PHẨM',
        bg: 'bg-indigo-600',
        text: 'text-indigo-600',
        shadow: 'shadow-indigo-100',
        gradient: 'from-indigo-600 to-blue-600'
      };
    }
    return {
      primary: 'emerald',
      label: 'HÓA ĐƠN',
      fullLabel: 'HÓA ĐƠN BÁN HÀNG',
      bg: 'bg-emerald-600',
      text: 'text-emerald-600',
      shadow: 'shadow-emerald-100',
      gradient: 'from-emerald-600 to-blue-600'
    };
  }, [invoice.docType]);

  // Sync data to localStorage
  useEffect(() => {
    if (currentUser) localStorage.setItem('mqb_session_user_data', JSON.stringify(currentUser));
    else localStorage.removeItem('mqb_session_user_data');
  }, [currentUser]);

  useEffect(() => localStorage.setItem('mqb_users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('mqb_seller_profile', JSON.stringify(sellerProfile)), [sellerProfile]);
  useEffect(() => localStorage.setItem('mqb_customers', JSON.stringify(customers)), [customers]);
  useEffect(() => localStorage.setItem('mqb_categories', JSON.stringify(categories)), [categories]);
  useEffect(() => localStorage.setItem('mqb_units', JSON.stringify(units)), [units]);
  useEffect(() => localStorage.setItem('mqb_products', JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem('mqb_stock_entries', JSON.stringify(stockEntries)), [stockEntries]);
  useEffect(() => localStorage.setItem('mqb_all_invoices', JSON.stringify(allInvoices)), [allInvoices]);

  const totals = useMemo(() => {
    const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const tax = (subtotal * invoice.taxRate) / 100;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [invoice.items, invoice.taxRate]);

  const handleLogin = (user: UserAccount) => setCurrentUser(user);
  const handleLogout = () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi tài khoản My Shop Pro không?')) {
      setCurrentUser(null);
      // Force return to billing tab for next login
      setActiveTab('billing');
    }
  };

  // Category Management
  const handleAddCategory = (name: string) => {
    const newCategory: Category = {
      id: Math.random().toString(36).substr(2, 9),
      name: name
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const handleDeleteCategory = (id: string) => {
    const productsInCat = products.filter(p => p.categoryId === id);
    if (productsInCat.length > 0) {
      if (!confirm(`Chủng loại này đang có ${productsInCat.length} sản phẩm. Bạn vẫn muốn xóa chứ? Các sản phẩm sẽ trở thành 'Chưa phân loại'.`)) {
        return;
      }
    } else {
      if (!confirm('Bạn có chắc chắn muốn xóa chủng loại này?')) return;
    }
    setCategories(prev => prev.filter(c => c.id !== id));
    setProducts(prev => prev.map(p => p.categoryId === id ? { ...p, categoryId: '' } : p));
  };

  // Unit Management
  const handleAddUnit = (name: string) => {
    const newUnit: Unit = {
      id: Math.random().toString(36).substr(2, 9),
      name: name
    };
    setUnits(prev => [...prev, newUnit]);
  };

  const handleDeleteUnit = (id: string) => {
    const productsWithUnit = products.filter(p => p.unit === units.find(u => u.id === id)?.name);
    if (productsWithUnit.length > 0) {
      alert(`Đơn vị tính này đang được sử dụng bởi ${productsWithUnit.length} sản phẩm. Vui lòng cập nhật sản phẩm trước khi xóa.`);
      return;
    }
    if (confirm('Bạn có chắc chắn muốn xóa đơn vị tính này?')) {
      setUnits(prev => prev.filter(u => u.id !== id));
    }
  };

  const handleAddUser = (userData: Partial<UserAccount>) => {
    const newUser: UserAccount = {
      id: Math.random().toString(36).substr(2, 9),
      username: userData.username || '',
      password: userData.password || '123456',
      fullName: userData.fullName || '',
      role: userData.role || 'Staff',
      createdAt: new Date().toISOString()
    };
    setUsers(prev => [...prev, newUser]);
  };

  const handleUpdateUser = (updated: UserAccount) => {
    setUsers(prev => prev.map(u => u.id === updated.id ? { 
      ...updated, 
      password: updated.password || prev.find(x => x.id === updated.id)?.password 
    } : u));
    if (currentUser?.id === updated.id) {
      setCurrentUser(prev => prev ? ({ ...prev, fullName: updated.fullName, role: updated.role }) : null);
    }
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  const handleTypeChange = (type: DocumentType) => {
    const prefix = type === 'Invoice' ? 'INV-' : 'QT-';
    const newNumber = prefix + Math.floor(1000 + Math.random() * 9000);
    setInvoice(prev => ({ ...prev, docType: type, invoiceNumber: newNumber, notes: '' }));
  };

  const handleAddCustomer = (data: Partial<Customer>) => {
    const newCustomer: Customer = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name || 'Khách hàng mới',
      email: data.email || '',
      phone: data.phone || '',
      address: data.address || '',
      notes: data.notes || '',
      createdAt: new Date().toISOString()
    };
    setCustomers(prev => [...prev, newCustomer]);
  };

  const handleUpdateCustomer = (updated: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const handleDeleteCustomer = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
      setCustomers(prev => prev.filter(c => c.id !== id));
    }
  };

  const addStockEntry = (entry: Partial<StockEntry>) => {
    const newEntry: StockEntry = {
      id: Math.random().toString(36).substr(2, 9),
      productId: entry.productId || '',
      quantity: entry.quantity || 0,
      entryDate: entry.entryDate || new Date().toISOString(),
    };
    setStockEntries(prev => [...prev, newEntry]);
  };

  const handleQRScan = useCallback((data: string) => {
    setIsQRScannerOpen(false);
    const matchedProduct = products.find(p => p.id === data || p.name === data);
    if (matchedProduct) {
      selectProductToInvoice(matchedProduct);
      return;
    }
    if (data.length > 2) {
      const newItem: InvoiceItem = { id: Math.random().toString(36).substr(2, 9), description: data, quantity: 1, price: 0, costPrice: 0 };
      setInvoice(prev => ({ ...prev, items: [...prev.items, newItem] }));
    }
  }, [products]);

  const addProduct = (data: Partial<Product>) => {
    const newProd: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name: data.name || 'Sản phẩm mới',
      categoryId: data.categoryId || '',
      unit: data.unit || 'Cái',
      price: data.price || 0,
      costPrice: data.costPrice || 0,
      initialStock: data.initialStock || 0
    };
    setProducts(prev => [newProd, ...prev]);
  };

  const saveInvoice = () => {
    if (invoice.items.length === 0) return alert('Chưa có sản phẩm nào!');
    const newInv = { ...invoice, id: Date.now().toString() };
    setAllInvoices(prev => [...prev, newInv]);
    alert('Đã lưu thành công. Bạn có thể xem lại trong tab Đơn hàng.');
    setInvoice(prev => ({
      ...prev,
      items: [],
      clientName: '',
      clientEmail: '',
      clientAddress: '',
      invoiceNumber: prev.docType === 'Invoice' ? 'INV-' + Math.floor(1000 + Math.random() * 9000) : 'QT-' + Math.floor(1000 + Math.random() * 9000)
    }));
  };

  const deleteOrder = (id: string) => {
    if (confirm('Xóa đơn hàng này? Thao tác này không thể hoàn tác.')) {
      setAllInvoices(prev => prev.filter(inv => inv.id !== id));
    }
  };

  const updateOrderStatus = (id: string, status: Invoice['status']) => {
    setAllInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv));
  };

  const loadOrder = (order: Invoice) => {
    setInvoice(order);
    setActiveTab('billing');
  };

  const handleViewOrder = (order: Invoice) => {
    setInvoice(order);
    setShowPreview(true);
  };

  const selectCustomer = (customer: Customer) => {
    setInvoice(prev => ({ ...prev, clientName: customer.name, clientEmail: customer.email, clientAddress: customer.address }));
  };

  const addItem = () => {
    const newItem: InvoiceItem = { id: Math.random().toString(36).substr(2, 9), description: '', quantity: 1, price: 0, costPrice: 0 };
    setInvoice(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const selectProductToInvoice = (product: Product) => {
    const newItem: InvoiceItem = { 
      id: Math.random().toString(36).substr(2, 9), 
      productId: product.id,
      description: product.name, 
      unit: product.unit, 
      quantity: 1, 
      price: product.price,
      costPrice: product.costPrice 
    };
    setInvoice(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const updateItem = (updated: InvoiceItem) => setInvoice(prev => ({ ...prev, items: prev.items.map(item => item.id === updated.id ? updated : item) }));
  const deleteItem = (id: string) => setInvoice(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));

  const handleAiAdd = async () => {
    if (!aiInput.trim()) return;
    setIsProcessing(true);
    try {
      const newItems = await parseItemsFromText(aiInput);
      const itemsWithCost = newItems.map(item => {
        const prodMatch = products.find(p => p.name.toLowerCase() === item.description.toLowerCase());
        return {
          ...item,
          costPrice: prodMatch ? prodMatch.costPrice : 0
        };
      });
      setInvoice(prev => ({ ...prev, items: [...prev.items, ...itemsWithCost] }));
      setAiInput('');
    } catch (err) { alert('AI processing failed.'); }
    finally { setIsProcessing(false); }
  };

  const handleGenerateNote = async () => {
    setIsProcessing(true);
    try {
      const note = await generateProfessionalNote({
        clientName: invoice.clientName || 'Quý khách',
        total: formatCurrency(totals.total),
        docType: invoice.docType
      });
      setInvoice(prev => ({ ...prev, notes: note }));
    } catch (err) { console.error(err); }
    finally { setIsProcessing(false); }
  };

  if (!currentUser) return <Login onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 ${docTheme.bg} rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg`}>S</div>
              <h1 className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${docTheme.gradient}`}>My Shop Pro</h1>
            </div>
            <nav className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl">
              {currentUser.role === 'Admin' && (
                <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'dashboard' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>
                  <Icons.Chart /> Dashboard
                </button>
              )}
              <button onClick={() => setActiveTab('billing')} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'billing' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>
                <Icons.Bill /> Lập phiếu
              </button>
              <button onClick={() => setActiveTab('orders')} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'orders' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>
                <Icons.Clipboard /> Đơn hàng
              </button>
              <button onClick={() => setActiveTab('customers')} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'customers' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>
                <Icons.Users /> Khách hàng
              </button>
              <button onClick={() => setActiveTab('inventory')} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'inventory' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>
                <Icons.Archive /> Kho
              </button>
              <button onClick={() => setActiveTab('products')} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'products' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>
                <Icons.Folder /> Sản phẩm
              </button>
              {currentUser.role === 'Admin' && (
                <button onClick={() => setActiveTab('users')} className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'users' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>
                  <Icons.Shield /> Users
                </button>
              )}
            </nav>
          </div>
          
          <div className="flex items-center gap-6">
            <button onClick={() => setIsProfileModalOpen(true)} className="hidden sm:flex items-center gap-2 p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-all no-print" title="Hồ sơ cửa hàng">
              <Icons.Store />
              <span className="text-xs font-bold uppercase tracking-tight">Hồ sơ</span>
            </button>
            
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-slate-800">{currentUser.fullName}</div>
                <div className="flex items-center justify-end gap-1">
                  <span className={`text-[8px] font-black uppercase px-1 rounded ${currentUser.role === 'Admin' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>{currentUser.role}</span>
                </div>
              </div>
              <button 
                onClick={handleLogout} 
                className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all group relative no-print"
                title="Đăng xuất tài khoản"
              >
                <Icons.Logout />
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[8px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 animate-in fade-in duration-500">
        {activeTab === 'dashboard' && currentUser.role === 'Admin' ? (
          <Dashboard invoices={allInvoices} />
        ) : activeTab === 'orders' ? (
          <OrderManagement invoices={allInvoices} onDelete={deleteOrder} onUpdateStatus={updateOrderStatus} onLoadOrder={loadOrder} onViewOrder={handleViewOrder} />
        ) : activeTab === 'customers' ? (
          <CustomerManagement customers={customers} invoices={allInvoices} onAdd={handleAddCustomer} onUpdate={handleUpdateCustomer} onDelete={handleDeleteCustomer} />
        ) : activeTab === 'products' ? (
          <ProductManagement products={products} categories={categories} units={units} onAddProduct={addProduct} onUpdateProduct={setProducts as any} onDeleteProduct={setProducts as any} onAddCategory={handleAddCategory} onDeleteCategory={handleDeleteCategory} onAddUnit={handleAddUnit} onDeleteUnit={handleDeleteUnit} />
        ) : activeTab === 'inventory' ? (
          <InventoryManagement products={products} stockEntries={stockEntries} invoices={allInvoices} onAddStock={addStockEntry} />
        ) : activeTab === 'users' && currentUser.role === 'Admin' ? (
          <UserManagement users={users} currentUser={currentUser.username} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className={`lg:col-span-2 space-y-6`}>
              <div className="no-print bg-white p-1 rounded-2xl border border-slate-200 flex shadow-sm w-fit mb-4">
                <button onClick={() => handleTypeChange('Invoice')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${invoice.docType === 'Invoice' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500'}`}>Hóa đơn</button>
                <button onClick={() => handleTypeChange('Quotation')} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${invoice.docType === 'Quotation' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}>Báo giá</button>
              </div>

              <section className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="p-8 md:p-12">
                  <div className="flex flex-col md:flex-row justify-between gap-8 pb-10 mb-10 border-b border-slate-100">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{sellerProfile.businessName}</h2>
                      {sellerProfile.taxCode && <p className="text-xs text-slate-500 font-medium">MST: {sellerProfile.taxCode}</p>}
                      <p className="text-xs text-slate-500 font-medium">{sellerProfile.address}</p>
                      <div className="flex gap-4 mt-2">
                        {sellerProfile.phone && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">SĐT: {sellerProfile.phone}</p>}
                        {sellerProfile.email && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Email: {sellerProfile.email}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                       <div className={`inline-block px-4 py-1 rounded-full ${docTheme.bg} text-white text-[10px] font-black uppercase tracking-widest mb-4`}>
                          {invoice.docType === 'Quotation' ? 'Báo giá' : 'Hóa đơn'}
                       </div>
                       <h3 className="text-sm font-mono font-bold text-slate-700">{invoice.invoiceNumber}</h3>
                       <p className="text-xs text-slate-400 mt-1">{formatDate(invoice.date)}</p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between mb-12 gap-8">
                    <div className="space-y-4 flex-1">
                      <div className="flex justify-between items-center mb-1 no-print">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Khách hàng</h2>
                        <select onChange={(e) => { const c = customers.find(x => x.id === e.target.value); if (c) selectCustomer(c); }} className="text-[10px] bg-slate-50 border-none rounded-md px-2 py-0.5 font-bold">
                          <option value="">Chọn từ danh bạ</option>
                          {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <input type="text" placeholder="Tên khách hàng" value={invoice.clientName} onChange={(e) => setInvoice({ ...invoice, clientName: e.target.value })} className={`text-xl font-bold w-full outline-none focus:${docTheme.text} placeholder:text-slate-200`} />
                      <textarea placeholder="Địa chỉ khách hàng..." value={invoice.clientAddress} onChange={(e) => setInvoice({ ...invoice, clientAddress: e.target.value })} className="w-full text-slate-500 text-sm outline-none resize-none placeholder:text-slate-200" rows={1} />
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className={`text-sm font-black mb-6 ${docTheme.text} uppercase tracking-widest`}>Danh sách mặt hàng</h3>
                    <div className="grid grid-cols-12 gap-3 pb-3 border-b-2 border-slate-200 mb-2">
                      <div className="col-span-6 text-[10px] font-bold text-slate-400 uppercase">Sản phẩm / Dịch vụ</div>
                      <div className="col-span-2 text-[10px] font-bold text-slate-400 uppercase text-center">SL</div>
                      <div className="col-span-3 text-[10px] font-bold text-slate-400 uppercase text-right">Đơn giá</div>
                    </div>
                    {invoice.items.map(item => <InvoiceItemRow key={item.id} item={item} onUpdate={updateItem} onDelete={() => deleteItem(item.id)} />)}
                    <button onClick={addItem} className={`mt-6 flex items-center gap-2 ${docTheme.text} font-black text-[10px] uppercase tracking-widest no-print hover:opacity-70 transition-all`}><Icons.Plus /> Thêm dòng</button>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between gap-12 mt-12 pt-12 border-t border-slate-100">
                    <div className="flex-1 space-y-4">
                      <div className="flex justify-between items-center no-print">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ghi chú & Điều khoản</h3>
                        <button onClick={handleGenerateNote} disabled={isProcessing} className="text-[10px] text-blue-600 font-black uppercase flex items-center gap-1 hover:opacity-70"><Icons.Sparkles /> AI Đề xuất</button>
                      </div>
                      <textarea value={invoice.notes} onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })} className="w-full bg-slate-50 rounded-2xl p-4 text-sm resize-none outline-none border border-transparent focus:border-slate-100 transition-all" rows={3} />
                    </div>
                    <div className="w-full md:w-80 space-y-4">
                      <div className="flex justify-between text-sm items-center"><span className="text-slate-500 font-medium">Tạm tính</span><span className="font-bold text-slate-800">{formatCurrency(totals.subtotal)}</span></div>
                      <div className="flex justify-between text-sm items-center"><span className="text-slate-500 font-medium">VAT ({invoice.taxRate}%)</span><span className="font-bold text-slate-800">{formatCurrency(totals.tax)}</span></div>
                      <div className="flex justify-between items-end pt-4 border-t-2 border-slate-100">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Tổng cộng</span>
                        <span className={`text-2xl font-black ${docTheme.text}`}>{formatCurrency(totals.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <div className="no-print flex flex-col sm:flex-row gap-4">
                  <button onClick={() => setShowPreview(true)} className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-sm font-bold bg-slate-800 text-white hover:bg-slate-700 transition-all shadow-xl shadow-slate-200">
                    <Icons.Eye /> Xem trước
                  </button>
                  <button onClick={saveInvoice} className={`flex-1 py-4 rounded-2xl text-sm font-bold bg-white border-2 border-${docTheme.primary}-100 ${docTheme.text} hover:bg-${docTheme.primary}-50 transition-all shadow-sm`}>Lưu {invoice.docType === 'Invoice' ? 'Hóa đơn' : 'Báo giá'}</button>
                  <button onClick={() => window.print()} className={`flex-1 flex items-center justify-center gap-2 ${docTheme.bg} text-white py-4 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl ${docTheme.shadow} hover:scale-[1.01] transition-all active:scale-[0.99]`}>
                    <Icons.Printer /> In ngay
                  </button>
              </div>
            </div>

            <aside className="space-y-6 no-print">
              <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Sản phẩm nhanh</h4>
                  <button onClick={() => setIsQRScannerOpen(true)} className="bg-slate-900 text-white p-2 rounded-xl hover:bg-black transition-all shadow-lg"><Icons.QR /></button>
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                  {products.length === 0 ? (
                    <div className="py-8 text-center text-slate-300 text-xs italic">Chưa có sản phẩm.</div>
                  ) : (
                    products.map(p => (
                      <button key={p.id} onClick={() => selectProductToInvoice(p)} className={`w-full text-left p-4 rounded-2xl border border-slate-50 hover:bg-${docTheme.primary}-50 hover:border-${docTheme.primary}-100 transition-all group`}>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">{p.name}</span>
                          <span className="text-[10px] font-black text-slate-400 group-hover:text-slate-600">{formatCurrency(p.price)}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">{p.unit}</div>
                      </button>
                    ))
                  )}
                </div>
              </section>

              <section className={`bg-gradient-to-br from-slate-900 to-indigo-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group`}>
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                   <Icons.Sparkles />
                </div>
                <h3 className="font-black text-lg flex items-center gap-2 mb-4 tracking-tight"><Icons.Sparkles /> Trợ lý AI</h3>
                <p className="text-xs text-indigo-200 mb-6 leading-relaxed">Dán nội dung đặt hàng vào đây, AI sẽ tự động tách thành danh sách mặt hàng cho bạn.</p>
                <textarea value={aiInput} onChange={(e) => setAiInput(e.target.value)} placeholder="Ví dụ: '3 ly bạc xỉu, 2 bánh bao nhân thịt'..." className="w-full bg-white/10 border border-white/10 focus:border-white/30 rounded-2xl p-5 text-sm outline-none mb-4 min-h-[120px] transition-all placeholder:text-white/20" />
                <button onClick={handleAiAdd} disabled={isProcessing || !aiInput.trim()} className="w-full py-4 bg-white text-slate-900 font-black uppercase text-xs tracking-widest rounded-2xl active:scale-95 transition-all shadow-xl disabled:opacity-50">
                  {isProcessing ? 'Đang phân tích...' : 'Áp dụng bằng AI'}
                </button>
              </section>
            </aside>
          </div>
        )}
      </main>

      {isQRScannerOpen && <QRScanner onScan={handleQRScan} onClose={() => setIsQRScannerOpen(false)} />}
      {isProfileModalOpen && (
        <SellerProfileModal profile={sellerProfile} onSave={(p) => { setSellerProfile(p); setIsProfileModalOpen(false); }} onClose={() => setIsProfileModalOpen(false)} />
      )}
      {showPreview && (
        <InvoicePreview invoice={invoice} seller={sellerProfile} onClose={() => setShowPreview(false)} onPrint={() => { setShowPreview(false); window.print(); }} />
      )}
      
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around py-4 z-[60] shadow-[0_-10px_30px_rgba(0,0,0,0.05)] no-print">
        {currentUser.role === 'Admin' && (
          <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1.5 ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}><Icons.Chart /> <span className="text-[8px] font-black uppercase tracking-widest">DASH</span></button>
        )}
        <button onClick={() => setActiveTab('billing')} className={`flex flex-col items-center gap-1.5 ${activeTab === 'billing' ? docTheme.text : 'text-slate-400'}`}><Icons.Bill /> <span className="text-[8px] font-black uppercase tracking-widest">PHIẾU</span></button>
        <button onClick={() => setActiveTab('orders')} className={`flex flex-col items-center gap-1.5 ${activeTab === 'orders' ? 'text-indigo-600' : 'text-slate-400'}`}><Icons.Clipboard /> <span className="text-[8px] font-black uppercase tracking-widest">ĐƠN</span></button>
        <button onClick={() => setActiveTab('customers')} className={`flex flex-col items-center gap-1.5 ${activeTab === 'customers' ? 'text-indigo-600' : 'text-slate-400'}`}><Icons.Users /> <span className="text-[8px] font-black uppercase tracking-widest">KHÁCH</span></button>
        <button onClick={() => setIsProfileModalOpen(true)} className="flex flex-col items-center gap-1.5 text-slate-400"><Icons.Store /> <span className="text-[8px] font-black uppercase tracking-widest">HỒ SƠ</span></button>
        <button onClick={handleLogout} className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-red-500 transition-colors"><Icons.Logout /> <span className="text-[8px] font-black uppercase tracking-widest">THOÁT</span></button>
      </nav>
    </div>
  );
};

export default App;
