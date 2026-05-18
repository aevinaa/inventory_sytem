import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { scanSale } from '../api/sales';
import {
  ScanBarcode,
  AlertTriangle,
  CheckCircle,
  Package,
  Store,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useShopStore from '../store/shopStore';

const Scan = () => {
  const inputRef = useRef(null);

  const { currentShop } = useShopStore();

  const [barcode, setBarcode] = useState('');
  const [scans, setScans] = useState([]);

  // Focus scanner input only when shop changes
  useEffect(() => {
    if (!currentShop) return;

    inputRef.current?.focus();
  }, [currentShop]);

  const scanMutation = useMutation({
    mutationFn: scanSale,

    onSuccess: (data) => {
      toast.success(`Scanned: ${data.product_name}`);

      setScans((prev) => [
        {
          id: Date.now(),
          barcode,
          productName: data.product_name,
          quantityRemaining: data.quantity_remaining,
          lowStockAlert: data.low_stock_alert,
          time: new Date(),
        },
        ...prev,
      ].slice(0, 10));

      if (data.low_stock_alert) {
        toast.error(
          `Low stock alert: Only ${data.quantity_remaining} left!`,
          { icon: '⚠️' }
        );
      }

      setBarcode('');

      // Refocus after successful scan
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.detail ||
        'Scan failed or product not found'
      );

      setBarcode('');

      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    },
  });

  const handleKeyDown = (e) => {
    if (e.key !== 'Enter') return;

    e.preventDefault();

    if (!barcode.trim()) return;

    if (!currentShop?.id) {
      toast.error('Please select a shop first');
      return;
    }

    scanMutation.mutate({
      barcode: barcode.trim(),
      quantity: 1,
      shop_id: currentShop.id,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#1a3c5e] mb-2 flex items-center justify-center gap-3">
          <ScanBarcode size={32} />
          Barcode Scanner
        </h1>

        <p className="text-gray-500">
          Scan items to record a sale. Scanner acts like keyboard input.
        </p>

        {currentShop && (
          <div className="mt-3 inline-flex items-center gap-2 bg-[#fef7ea] text-[#c9922a] px-4 py-2 rounded-full font-semibold text-sm">
            <Store size={16} />
            {currentShop.name}
          </div>
        )}
      </div>

      {/* Scanner */}
      <div className="bg-white rounded-2xl shadow-lg border border-[#c9922a]/20 p-8">
        <div className="relative max-w-lg mx-auto">
          <div
            className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${scanMutation.isPending
                ? 'bg-blue-100 opacity-50'
                : 'opacity-0'
              }`}
          ></div>

          <input
            ref={inputRef}
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              currentShop
                ? 'Ready to scan...'
                : 'Select a shop first'
            }
            disabled={!currentShop}
            className="w-full text-center text-3xl py-6 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-[#1a3c5e] focus:ring-4 focus:ring-[#1a3c5e]/20 transition-all font-mono disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            autoComplete="off"
            autoFocus
          />

          {scanMutation.isPending && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-6 h-6 border-4 border-[#1a3c5e] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>

      {/* No Shop Selected */}
      {!currentShop && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <p className="text-3xl mb-2">🏪</p>

          <p className="font-semibold text-yellow-800">
            Please select a shop from the top bar
          </p>

          <p className="text-sm text-yellow-700 mt-1">
            Scanner is disabled until a shop is selected
          </p>
        </div>
      )}

      {/* Recent Scans */}
      {scans.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Package size={18} />
              Recent Scans
            </h3>
          </div>

          <ul className="divide-y divide-gray-100">
            {scans.map((scan) => (
              <li
                key={scan.id}
                className={`p-4 flex items-center justify-between ${scan.lowStockAlert
                    ? 'bg-red-50'
                    : 'hover:bg-gray-50'
                  } transition-colors`}
              >
                <div className="flex items-center gap-4">
                  {scan.lowStockAlert ? (
                    <AlertTriangle
                      className="text-red-500"
                      size={24}
                    />
                  ) : (
                    <CheckCircle
                      className="text-green-500"
                      size={24}
                    />
                  )}

                  <div>
                    <p className="font-medium text-gray-900 text-lg">
                      {scan.productName}
                    </p>

                    <p className="text-sm text-gray-500 font-mono">
                      Barcode: {scan.barcode}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`font-bold text-lg ${scan.lowStockAlert
                        ? 'text-red-600'
                        : 'text-gray-900'
                      }`}
                  >
                    {scan.quantityRemaining} left
                  </p>

                  <p className="text-xs text-gray-400">
                    {scan.time.toLocaleTimeString()}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Scan;