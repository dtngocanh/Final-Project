import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProvinces,
  fetchDistricts,
  fetchWards,
  resetDistricts,
  resetWards,
  resetAddressState,
} from "../../store/slices/addressSlice";

const AddressSelection = ({
  shippingDetails,
  setShippingDetails,
  errors,
  setErrors,
}) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchProvinces());
  }, [dispatch]);

  const { provinces, districts, wards, loading } = useSelector(
    (state) => state.address,
  );

  const handleProvinceChange = (e) => {
    const provinceId = e.target.value;
    const provinceName = e.target.options[e.target.selectedIndex].text;

    setShippingDetails({
      ...shippingDetails,
      provinceId,
      city: provinceName,
      districtId: "",
      district: "",
      wardCode: "",
      ward: "",
    });

    dispatch(resetDistricts());
    // console.log(provinceId);

    if (provinceId) dispatch(fetchDistricts(provinceId));
    if (errors.city) setErrors({ ...errors, city: null });
  };

  const handleDistrictChange = (e) => {
    const districtId = e.target.value;
    const districtName = e.target.options[e.target.selectedIndex].text;

    if (!districtId) return;

    setShippingDetails((prev) => ({
      ...prev,
      districtId: districtId,
      district: districtName,
      wardCode: "",
      ward: "",
    }));

    dispatch(resetWards());
    dispatch(fetchWards(districtId));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* SELECT TỈNH / THÀNH PHỐ */}
      <div className="md:col-span-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">
          Province / City
        </label>
        <div className="relative">
          <select
            name="provinceId"
            value={shippingDetails.provinceId || ""}
            onChange={handleProvinceChange}
            className={`w-full p-4 bg-slate-50 rounded-2xl outline-none transition-all border appearance-none ${
              errors.provinceId
                ? "border-red-300 ring-1 ring-red-100"
                : "border-transparent focus:ring-2 focus:ring-[#77cd3a]"
            }`}
          >
            <option value="">Select Province</option>
            {provinces.map((p) => (
              <option key={p.provinceId} value={p.provinceId}>
                {p.provinceName}
              </option>
            ))}
          </select>
          {/* Icon mũi tên xuống cho đẹp vì dùng appearance-none */}
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        {errors.provinceId && (
          <p className="text-[9px] text-red-400 ml-3 font-medium animate-pulse italic mt-1">
            * {errors.provinceId}
          </p>
        )}
      </div>

      {/* SELECT QUẬN / HUYỆN */}
      <div className="md:col-span-1">
        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">
          District
        </label>
        <div className="relative">
          <select
            name="districtId"
            disabled={!shippingDetails.provinceId}
            value={shippingDetails.districtId || ""}
            onChange={handleDistrictChange}
            className={`w-full p-4 bg-slate-50 rounded-2xl outline-none transition-all border appearance-none disabled:opacity-50 ${
              errors.districtId
                ? "border-red-300 ring-1 ring-red-100"
                : "border-transparent focus:ring-2 focus:ring-[#77cd3a]"
            }`}
          >
            <option value="">Select District</option>
            {districts.map((d) => (
              <option key={d.DistrictID} value={d.DistrictID}>
                {d.DistrictName}
              </option>
            ))}
          </select>

          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* SELECT PHƯỜNG / XÃ */}
      <div className="md:col-span-1">
        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">
          Ward
        </label>
        <div className="relative">
          <select
            name="wardCode"
            disabled={!shippingDetails.districtId}
            value={shippingDetails.wardCode || ""}
            onChange={(e) => {
              const wardCode = e.target.value;
              const wardName = e.target.options[e.target.selectedIndex].text;
              setShippingDetails({
                ...shippingDetails,
                wardCode,
                ward: wardName,
              });
            }}
            className={`w-full p-4 bg-slate-50 rounded-2xl outline-none transition-all border appearance-none disabled:opacity-50 ${
              errors.wardCode
                ? "border-red-300 ring-1 ring-red-100"
                : "border-transparent focus:ring-2 focus:ring-[#77cd3a]"
            }`}
          >
            <option value="">Select Ward</option>
            {wards.map((w) => (
              <option key={w.WardCode} value={w.WardCode}>
                {w.WardName}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressSelection;
