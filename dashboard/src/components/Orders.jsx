import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { fetchAllOrders, updateOrderStatus, clearErrors, resetStatus } from "../store/slices/orderSlice";
import { Eye, Clock, Trash2, ShoppingBag } from "lucide-react";
import { toast } from "react-toastify";
import FloatingVegetables from "./Fruit/FloatingVegetables"; 
import OrderDetailsModal from "./OrderDetailsModal";

const Orders = () => {
  const dispatch = useDispatch();
  const { orders: reduxOrders = [], loading, error, success } = useSelector((state) => state.order);
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // --- MOCK DATA TẠI ĐÂY ---
  const mockData = [
    {
      _id: "69cdcd6d74780b03b13e536c",
      shippingInfo: { name: "Zeeshan Khan", phone: "0987779891", address: "Khyber Pakhtunkhwa, KPK" },
      orderItems: [{ name: "Organic Carrot", quantity: 2, price: 2.5 }, { name: "Vegan Milk", quantity: 1, price: 3.0 }],
      totalPrice: 8.0,
      orderStatus: "Pending"
    },
    {
      _id: "7e69e797a45149c687cee079",
      shippingInfo: { name: "Nguyen Van A", phone: "0905123456", address: "Da Nang, VN" },
      orderItems: [{ name: "Salad Box", quantity: 1, price: 15.0 }],
      totalPrice: 15.0,
      orderStatus: "Delivered"
    }
  ];

  // Nếu reduxOrders trống, dùng mockData để hiển thị cho đẹp
  const displayOrders = reduxOrders.length > 0 ? reduxOrders : mockData;

  useEffect(() => { dispatch(fetchAllOrders()); }, [dispatch]);

  const handleDelete = (id) => {
    if(window.confirm("Do you want to delete this order?")) {
      toast.error(`Order ${id.slice(-6)} deleted!`);
      // dispatch(deleteOrder(id)); 
    }
  };

  const filteredOrders = displayOrders.filter(o => filterStatus === "All" || o.orderStatus === filterStatus);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#fcfdfd]">
      <FloatingVegetables activeColor="#77cd3af2" />

      <div className="relative z-10 p-6 font-['Fredoka']">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-light text-gray-800">
            Customer <span className="text-[#77cd3af2] font-serif italic">Orders</span>
          </h1>
          {/* Filter Buttons nãy tôi viết rồi, ní giữ nguyên nhé */}
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-[35px] shadow-xl border border-white overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#f8faf9]/50 text-[10px] uppercase tracking-widest text-gray-400">
              <tr>
                <th className="px-8 py-6">Order ID</th>
                <th className="px-6 py-6">Customer</th>
                <th className="px-6 py-6 text-center">Total</th>
                <th className="px-6 py-6">Status</th>
                <th className="px-6 py-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-20 text-[#77cd3af2] animate-pulse font-bold">Syncing...</td></tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-white group transition-all duration-300">
                    <td className="px-8 py-7 font-bold text-gray-400 text-xs italic">#{order._id?.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-7 font-bold text-gray-800">{order.shippingInfo?.name}</td>
                    <td className="px-6 py-7 text-center font-black text-[#77cd3af2] text-base">${order.totalPrice?.toFixed(2)}</td>
                    <td className="px-6 py-7">
                      <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase border bg-orange-50 text-orange-500 border-orange-100">
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-7">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => setSelectedOrder(order)} className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-800 hover:text-white transition-all"><Eye size={18}/></button>
                        <button onClick={() => handleDelete(order._id)} className="p-2.5 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                /* --- TRƯỜNG HỢP KHÔNG CÓ ĐƠN HÀNG --- */
                <tr>
                  <td colSpan="5" className="text-center py-32">
                    <div className="flex flex-col items-center opacity-20">
                      <ShoppingBag size={64} className="mb-4 text-gray-400" />
                      <p className="text-2xl font-light italic">No orders found in this category.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
};

export default Orders;