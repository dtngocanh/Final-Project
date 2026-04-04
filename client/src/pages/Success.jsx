import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, ShoppingBag, Package } from 'lucide-react';



const Success = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-10 text-center border border-slate-100">

        {/* Success Icon with Animation */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-green-100 rounded-full scale-150 animate-pulse"></div>
            <div className="relative bg-green-500 p-5 rounded-full shadow-lg">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Payment Successful!
        </h1>
        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
          Thank you for your purchase. We’ve received your order and our team is already getting it ready for shipment.
        </p>

        {/* Transaction Reference Box */}
        {sessionId && (
          <div className="bg-slate-50 rounded-2xl p-4 mb-10 border border-slate-200 inline-block px-6">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
              Order Reference
            </p>
            <p className="text-sm font-mono text-indigo-600 font-medium break-all">
              {sessionId.slice(0, 24)}...
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/orders"
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg shadow-slate-200"
          >
            <Package size={20} />
            Track Order
          </Link>

          <Link
            to="/"
            className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold py-4 px-6 rounded-2xl border-2 border-slate-200 transition-all duration-300"
          >
            <ShoppingBag size={20} />
            Continue Shopping
            <ArrowRight size={18} className="ml-1" />
          </Link>
        </div>

        {/* Help Link */}
        <div className="mt-12 pt-8 border-t border-slate-100">
          <p className="text-sm text-slate-400">
            Need help? Contact our support team at{' '}
            <a href="mailto:support@yourstore.com" className="text-indigo-500 hover:underline font-medium">
              support@yourstore.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Success;