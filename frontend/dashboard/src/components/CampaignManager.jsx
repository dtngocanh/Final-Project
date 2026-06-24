import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllCampaigns,
  createNewCampaign,
  updateCampaign,
  deleteCampaign,
  triggerManualDiscount,
} from "../store/slices/campaignsSlice.js";
import { fetchCategories } from "../store/slices/categorySlice.js";
import { fetchAllProducts } from "../store/slices/productsSlice.js";
import {
  Trash2,
  Edit3,
  Zap,
  ZapOff,
  Clock,
  Tag,
  ShoppingBag,
  Plus,
} from "lucide-react";
import FloatingVegetables from "./Fruit/FloatingVegetables";
import CampaignFormModal from "../modals/CampaignFormModal.jsx";

const CampaignManager = () => {
  const dispatch = useDispatch();

  const campaignsState = useSelector((state) => state.campaigns);
  const categoryState = useSelector((state) => state.category);
  const productsState = useSelector((state) => state.product);

  const campaigns = campaignsState?.campaigns || [];
  const categories = categoryState?.categories || [];
  const products = productsState?.products || [];
  const campaignsLoading = campaignsState?.loading || false;
  const productsLoading = productsState?.loading || false;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    discountPercent: "",
    targetType: "category",
    category: "",
    product: "",
    startTime: "",
    endTime: "",
    saleLimit: "",
  });

  useEffect(() => {
    dispatch(fetchAllCampaigns());
    dispatch(fetchCategories());
    dispatch(fetchAllProducts({ page: 1, limit: 500 }));
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "targetType") {
      setFormData({
        ...formData,
        [name]: value,
        category: "",
        product: "",
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setEditId(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditClick = (campaign) => {
    setIsEditing(true);
    setEditId(campaign._id);

    const rawTargetType = (campaign.targetType || "category").toLowerCase();
    const isProductType = rawTargetType === "product" || rawTargetType === "products";
    const currentTargetType = isProductType ? "product" : "category";

    let productId = "";
    if (isProductType) {
      if (campaign.product) {
        productId = typeof campaign.product === "object" ? campaign.product._id : campaign.product;
      } else if (campaign.products && campaign.products.length > 0) {
        productId = typeof campaign.products[0] === "object" ? campaign.products[0]._id : campaign.products[0];
      }
    }

    let categoryId = "";
    if (currentTargetType === "category" && campaign.category) {
      categoryId = typeof campaign.category === "object" ? campaign.category._id : campaign.category;
    }

    setFormData({
      name: campaign.name || "",
      discountPercent: campaign.discountPercent || "",
      targetType: currentTargetType,
      category: currentTargetType === "category" ? categoryId : "",
      product: currentTargetType === "product" ? productId : "",
      startTime: campaign.startTime || "",
      endTime: campaign.endTime || "",
      saleLimit: campaign.saleLimit || "",
    });

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditId(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      discountPercent: "",
      targetType: "category",
      category: "",
      product: "",
      startTime: "",
      endTime: "",
      saleLimit: "",
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.discountPercent || !formData.startTime || !formData.endTime) {
      alert("Please fill in all required fields!");
      return;
    }
    if (formData.targetType === "category" && !formData.category) {
      alert("Please select a target category!");
      return;
    }
    if (formData.targetType === "product" && !formData.product) {
      alert("Please select a specific target product!");
      return;
    }

    const cleanedPayload = {
      name: formData.name,
      discountPercent: Number(formData.discountPercent),
      targetType: formData.targetType, 
      startTime: formData.startTime,
      endTime: formData.endTime,
      saleLimit: formData.saleLimit ? Number(formData.saleLimit) : 0,
    };

    if (formData.targetType === "product") {
      cleanedPayload.product = formData.product;
    } else {
      cleanedPayload.category = formData.category;
    }

    if (isEditing) {
      dispatch(updateCampaign({ id: editId, campaignData: cleanedPayload })).then((action) => {
        if (updateCampaign.fulfilled.match(action)) {
          handleCloseModal();
          dispatch(fetchAllCampaigns());
        }
      });
    } else {
      dispatch(createNewCampaign(cleanedPayload)).then((action) => {
        if (createNewCampaign.fulfilled.match(action)) {
          handleCloseModal();
          dispatch(fetchAllCampaigns());
        }
      });
    }
  };

  const handleTriggerDiscount = (id, actionType) => {
    dispatch(triggerManualDiscount({ id, action: actionType })).then(() => {
      dispatch(fetchAllCampaigns());
    });
  };

  const handleDeleteCampaign = (id) => {
    if (window.confirm("Are you sure you want to permanently delete this promotional campaign?")) {
      dispatch(deleteCampaign(id)).then(() => {
        dispatch(fetchAllCampaigns());
      });
    }
  };

  const isGlobalLoading = campaignsLoading || productsLoading;

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#fbfdfa] font-['Fredoka'] pb-20 select-none text-slate-700">
      <FloatingVegetables activeColor="#77cd3af2" />

      <div className="relative z-10 p-4 sm:p-6 max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 border-b border-slate-100 pb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">
              Flash Sale{" "}
              <span className="text-[#77cd3af2] italic font-semibold">Campaigns</span>
            </h1>
            <p className="text-gray-400 text-[11px] font-medium mt-1 tracking-widest uppercase opacity-80">
              Configure and manage automated or manual time-window discount schedules
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 bg-[#77cd3af2] hover:bg-[#6ab933] text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-sm shadow-green-100 active:scale-95 transition-all self-start sm:self-center"
          >
            <Plus size={18} />
            Create Campaign
          </button>
        </div>

        {/* DATA TABLE BOARD */}
        <div className="bg-white rounded-[40px] shadow-[0_10px_30px_rgba(119,205,58,0.04)] border border-slate-100/80 overflow-hidden">
          <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-50">
            <h3 className="text-md font-bold text-slate-800 uppercase tracking-wide">
              Active Campaign List
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/30 text-[10px] uppercase tracking-[0.2em] text-gray-400 border-b border-slate-50">
                  <th className="px-8 py-5 font-bold">Campaign Details</th>
                  <th className="px-6 py-5 font-bold text-center">Value</th>
                  <th className="px-6 py-5 font-bold">Target Scope</th>
                  <th className="px-6 py-5 font-bold">Sale Progress</th>
                  <th className="px-6 py-5 font-bold">
                    <div className="flex items-center gap-1.5"><Clock size={12} /> Duration</div>
                  </th>
                  <th className="px-6 py-5 font-bold text-center">Manual Override</th>
                  <th className="px-8 py-5 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm font-medium text-slate-600">
                {campaignsLoading && campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-gray-400 italic">
                      Loading campaign configs...
                    </td>
                  </tr>
                ) : campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-gray-400 italic font-normal">
                      No active sales found in the database.
                    </td>
                  </tr>
                ) : (
                  campaigns.map((cp) => {
                    const isUnlimited = !cp.saleLimit || cp.saleLimit === 0;
                    const percentSold = isUnlimited ? 0 : Math.min(100, ((cp.saleSold || 0) / cp.saleLimit) * 100);
                    const currentTargetType = (cp.targetType || "").toLowerCase();

                    return (
                      <tr key={cp._id} className="hover:bg-[#fbfdfa]/60 transition-colors duration-200">
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-1.5">
                            <span className="font-bold text-slate-800 text-base">{cp.name}</span>
                            <div>
                              {cp.isActive ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-500 border border-emerald-100">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Running
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-rose-50 text-rose-400 border border-rose-100">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span> Paused / End
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-center">
                          <span className="bg-rose-50/70 text-rose-500 font-bold px-3 py-1.5 rounded-xl text-xs border border-rose-100/50 tracking-wide">
                            -{cp.discountPercent}%
                          </span>
                        </td>
                        <td className="px-6 py-6">
                          {currentTargetType === "category" ? (
                            <span className="inline-flex items-center gap-1.5 bg-blue-50/60 text-blue-500 px-3 py-1.5 rounded-xl text-xs border border-blue-100/60">
                              <span className="w-3 h-3"><Tag size={12} /></span> {cp.category?.name || "N/A"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-purple-50/60 text-purple-500 px-3 py-1.5 rounded-xl text-xs border border-purple-100/60">
                              <span className="w-3 h-3"><ShoppingBag size={12} /></span>{" "}
                              {cp.product?.name || (cp.products && cp.products.length > 0 ? cp.products[0].name : "N/A")}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex flex-col gap-1 w-36">
                            <div className="flex justify-between text-[11px] font-bold text-slate-500">
                              <span>{cp.saleSold || 0} / {isUnlimited ? "∞" : cp.saleLimit} sold</span>
                              {!isUnlimited && <span>{Math.round(percentSold)}%</span>}
                            </div>
                            {!isUnlimited && (
                              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/40">
                                <div
                                  className={`h-full transition-all duration-500 rounded-full ${cp.isActive ? "bg-[#77cd3af2]" : "bg-slate-300"}`}
                                  style={{ width: `${percentSold}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-6 font-semibold text-slate-500 text-xs">
                          {cp.startTime} - {cp.endTime}
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              disabled={cp.isActive}
                              onClick={() => handleTriggerDiscount(cp._id, "start")}
                              className={`p-2 rounded-xl transition-all shadow-sm active:scale-90 ${
                                cp.isActive
                                  ? "bg-slate-50 text-slate-300 cursor-not-allowed opacity-50"
                                  : "bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                              }`}
                              title="Force Start Campaign"
                            >
                              <Zap size={14} />
                            </button>
                            <button
                              type="button"
                              disabled={!cp.isActive}
                              onClick={() => handleTriggerDiscount(cp._id, "end")}
                              className={`p-2 rounded-xl transition-all shadow-sm active:scale-90 ${
                                !cp.isActive
                                  ? "bg-slate-50 text-slate-300 cursor-not-allowed opacity-50"
                                  : "bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white"
                              }`}
                              title="Force Stop Campaign"
                            >
                              <ZapOff size={14} />
                            </button>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEditClick(cp)}
                              className="p-2.5 bg-amber-50 text-amber-500 rounded-xl hover:bg-amber-500 hover:text-white transition-all active:scale-90"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCampaign(cp._id)}
                              className="p-2.5 bg-rose-50 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all active:scale-90"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <CampaignFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isEditing={isEditing}
        formData={formData}
        categories={categories}
        products={products}
        isGlobalLoading={isGlobalLoading}
        onInputChange={handleInputChange}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default CampaignManager;