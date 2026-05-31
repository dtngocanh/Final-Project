import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { X, UploadCloud, FileSpreadsheet, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { toggleImportProductModal } from "../store/slices/extraSlice";
import { importProducts } from "../store/slices/productsSlice"; // Ensure this path is correct

const ImportProductModal = () => {
  const dispatch = useDispatch();
  
  // Select state from the correct slice name (product)
  const { loading } = useSelector((state) => state.product || { loading: false });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // Handle file selection via button
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    validateAndSetFile(file);
  };

  // Handle drag and drop events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    const validExtensions = ["xlsx", "xls", "csv"];
    const fileExtension = file.name.split(".").pop().toLowerCase();
    
    if (validExtensions.includes(fileExtension)) {
      setSelectedFile(file);
      setImportResult(null); // Reset result when new file is picked
    } else {
      alert("Invalid format! Please upload an Excel (.xlsx, .xls) or CSV file.");
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    const resultAction = await dispatch(importProducts(selectedFile));

    if (importProducts.fulfilled.match(resultAction)) {
      const data = resultAction.payload;
      setImportResult(data);
      
      // If 100% successful with no row errors, close modal after a delay
      if (data.success && data.failedCount === 0) {
        setTimeout(() => {
          dispatch(toggleImportProductModal());
        }, 2000);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white w-full max-w-lg rounded-[35px] p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Top Accent Bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-[#77cd3a]" />

        {/* Close Button */}
        <button
          onClick={() => dispatch(toggleImportProductModal())}
          className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-black text-gray-800">Import Inventory</h2>
          <p className="text-gray-500 text-sm mt-1">Upload your spreadsheet to add products in bulk.</p>
        </div>

        {/* Drop Zone */}
        {!importResult ? (
          <div 
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              relative group mb-6 flex flex-col items-center justify-center w-full h-52 
              border-2 border-dashed rounded-[25px] transition-all duration-300
              ${dragActive ? "border-[#77cd3a] bg-[#77cd3a08] scale-[1.02]" : "border-gray-200 bg-gray-50"}
              ${selectedFile ? "border-[#77cd3a] bg-[#77cd3a05]" : "hover:border-[#77cd3a]"}
            `}
          >
            <input
              type="file"
              id="excel-upload"
              className="hidden"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              disabled={loading}
            />
            
            <label htmlFor="excel-upload" className="cursor-pointer flex flex-col items-center p-6 text-center w-full h-full justify-center">
              {selectedFile ? (
                <>
                  <div className="w-16 h-16 bg-[#77cd3a15] rounded-full flex items-center justify-center mb-3">
                    <FileSpreadsheet size={32} className="text-[#77cd3a]" />
                  </div>
                  <p className="text-sm font-bold text-gray-700 truncate max-w-[250px]">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Ready for planting!</p>
                </>
              ) : (
                <>
                  <UploadCloud size={48} className={`mb-3 transition-colors ${dragActive ? "text-[#77cd3a]" : "text-gray-300"}`} />
                  <p className="text-sm font-medium text-gray-600">Drag & drop or click to browse</p>
                  <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest font-bold">XLSX, XLS, CSV ONLY</p>
                </>
              )}
            </label>
          </div>
        ) : (
          /* Result UI after import */
          <div className="mb-6 p-5 rounded-[25px] bg-gray-50 border border-gray-100">
             <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="text-[#77cd3a]" size={24} />
                <h3 className="font-bold text-gray-800">Import Results</h3>
             </div>
             <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div className="p-3 bg-white rounded-xl shadow-sm border-l-4 border-green-500">
                   <p className="text-gray-500 text-xs uppercase font-bold">Success</p>
                   <p className="text-xl font-black text-gray-800">{importResult.successCount}</p>
                </div>
                <div className={`p-3 bg-white rounded-xl shadow-sm border-l-4 ${importResult.failedCount > 0 ? 'border-red-500' : 'border-gray-200'}`}>
                   <p className="text-gray-500 text-xs uppercase font-bold">Failed</p>
                   <p className="text-xl font-black text-gray-800">{importResult.failedCount}</p>
                </div>
             </div>
             
             {importResult.errors?.length > 0 && (
                <div className="max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                   {importResult.errors.map((err, idx) => (
                      <div key={idx} className="text-[11px] text-red-500 bg-red-50 p-2 rounded-lg mb-1 flex items-start gap-2">
                         <span className="font-bold shrink-0">Row {err.row}:</span>
                         <span>{err.errors.join(", ")}</span>
                      </div>
                   ))}
                </div>
             )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={importResult ? () => setImportResult(null) : handleImport}
            disabled={(!selectedFile && !importResult) || loading}
            className={`
              w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all
              flex items-center justify-center gap-2
              ${loading || (!selectedFile && !importResult)
                ? "bg-gray-300 cursor-not-allowed shadow-none" 
                : "bg-[#77cd3a] hover:bg-[#68b332] shadow-[#77cd3a30] active:scale-95"
              }
            `}
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : importResult ? (
              <span>Upload Another File</span>
            ) : (
              <>
                <UploadCloud size={20} />
                <span>Start Planting</span>
              </>
            )}
          </button>

          {selectedFile && !loading && !importResult && (
            <button 
              onClick={() => setSelectedFile(null)}
              className="w-full text-xs text-gray-400 hover:text-red-500 font-medium transition-colors"
            >
              Cancel and pick another file
            </button>
          )}
        </div>

        {/* Helpful Note */}
        {!importResult && (
          <div className="mt-6 p-4 bg-blue-50 rounded-2xl flex gap-3">
            <AlertCircle size={18} className="text-blue-500 shrink-0 mt-0.5" />
            <div>
               <p className="text-xs font-bold text-blue-700 mb-1">Quick Instructions:</p>
               <p className="text-[11px] text-blue-600 leading-relaxed">
                Ensure columns match: <b>name, price, stock, category, subcategory, description, images</b>. 
                Category name must exist in the database.
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ImportProductModal;