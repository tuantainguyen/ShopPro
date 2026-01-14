
import React from 'react';
import { InvoiceItem } from '../types';
import { Icons } from '../constants';

interface Props {
  item: InvoiceItem;
  onUpdate: (updated: InvoiceItem) => void;
  onDelete: () => void;
}

const InvoiceItemRow: React.FC<Props> = ({ item, onUpdate, onDelete }) => {
  return (
    <div className="grid grid-cols-12 gap-3 items-center py-2 border-b border-slate-100 group">
      <div className="col-span-6">
        <input
          type="text"
          value={item.description}
          onChange={(e) => onUpdate({ ...item, description: e.target.value })}
          placeholder="Tên sản phẩm/dịch vụ"
          className="w-full bg-transparent outline-none focus:ring-0 text-sm font-medium"
        />
      </div>
      <div className="col-span-2">
        <input
          type="number"
          value={item.quantity}
          onChange={(e) => onUpdate({ ...item, quantity: Number(e.target.value) })}
          className="w-full bg-transparent outline-none focus:ring-0 text-sm text-center"
        />
      </div>
      <div className="col-span-3">
        <input
          type="number"
          value={item.price}
          onChange={(e) => onUpdate({ ...item, price: Number(e.target.value) })}
          className="w-full bg-transparent outline-none focus:ring-0 text-sm text-right font-semibold"
        />
      </div>
      <div className="col-span-1 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onDelete}
          className="text-red-400 hover:text-red-600 p-1"
          title="Xóa dòng"
        >
          <Icons.Trash />
        </button>
      </div>
    </div>
  );
};

export default InvoiceItemRow;
