import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getDailySales,
  getSalesTrend,
  getLowStock,
  exportSalesExcel,
  exportSalesPdf,
  exportInventoryExcel,
  exportInventoryPdf,
} from '../api/reports';
import { FileDown, FileText } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import toast from 'react-hot-toast';
import useShopStore from '../store/shopStore';

const Reports = () => {
  const today = new Date().toISOString().split('T')[0];

  const [targetDate, setTargetDate] = useState(today);
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [exporting, setExporting] = useState('');

  const { currentShop } = useShopStore();

  // Daily sales
  const {
    data: dailySales,
    isLoading: loadingDaily,
  } = useQuery({
    queryKey: ['dailySales', targetDate, currentShop?.id],
    queryFn: () => getDailySales(targetDate, currentShop?.id),
    enabled: !!currentShop?.id,
  });

  // Trend chart
  const {
    data: trendData = [],
    isLoading: loadingTrend,
  } = useQuery({
    queryKey: ['salesTrend', 30, currentShop?.id],
    queryFn: () => getSalesTrend(30, currentShop?.id),
    enabled: !!currentShop?.id,
  });

  // Low stock
  const {
    data: lowStockData = [],
    isLoading: loadingLowStock,
  } = useQuery({
    queryKey: ['lowStockReport', currentShop?.id],
    queryFn: () => getLowStock(currentShop?.id),
    enabled: !!currentShop?.id,
  });

  const handleExport = async (type) => {
    try {
      setExporting(type);

      const sid = currentShop?.id;

      if (type === 'sales-excel') {
        await exportSalesExcel(dateFrom, dateTo, sid);
      }

      if (type === 'sales-pdf') {
        await exportSalesPdf(dateFrom, dateTo, sid);
      }

      if (type === 'inventory-excel') {
        await exportInventoryExcel(sid);
      }

      if (type === 'inventory-pdf') {
        await exportInventoryPdf(sid);
      }

      toast.success('File downloaded successfully');
    } catch (err) {
      toast.error(
        'Export failed — ' +
        (err.response?.data?.detail || err.message)
      );
    } finally {
      setExporting('');
    }
  };

  const btnStyle = (type) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    borderRadius: 8,
    border: '1.5px solid #e5e7eb',
    background: 'white',
    cursor: exporting === type ? 'not-allowed' : 'pointer',
    fontSize: 13,
    fontWeight: 500,
    color: '#374151',
    opacity: exporting === type ? 0.6 : 1,
  });

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#1a3c5e',
            }}
          >
            Reports
          </h1>

          <p
            style={{
              color: '#6b7280',
              fontSize: 14,
              marginTop: 4,
            }}
          >
            Business insights and exports
          </p>

          {currentShop && (
            <p
              style={{
                color: '#c9922a',
                fontWeight: 600,
                marginTop: 4,
                fontSize: 14,
              }}
            >
              🏪 {currentShop.name}
            </p>
          )}
        </div>

        {/* Export Buttons */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            alignItems: 'flex-end',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span
              style={{
                fontSize: 13,
                color: '#6b7280',
              }}
            >
              From
            </span>

            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={{
                padding: '6px 10px',
                border: '1.5px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 13,
              }}
            />

            <span
              style={{
                fontSize: 13,
                color: '#6b7280',
              }}
            >
              To
            </span>

            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={{
                padding: '6px 10px',
                border: '1.5px solid #e5e7eb',
                borderRadius: 8,
                fontSize: 13,
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            <button
              style={btnStyle('sales-excel')}
              onClick={() => handleExport('sales-excel')}
            >
              <FileDown size={15} />
              {exporting === 'sales-excel'
                ? 'Downloading...'
                : 'Sales Excel'}
            </button>

            <button
              style={btnStyle('sales-pdf')}
              onClick={() => handleExport('sales-pdf')}
            >
              <FileText size={15} />
              {exporting === 'sales-pdf'
                ? 'Downloading...'
                : 'Sales PDF'}
            </button>

            <button
              style={btnStyle('inventory-excel')}
              onClick={() => handleExport('inventory-excel')}
            >
              <FileDown size={15} />
              {exporting === 'inventory-excel'
                ? 'Downloading...'
                : 'Inventory Excel'}
            </button>

            <button
              style={btnStyle('inventory-pdf')}
              onClick={() => handleExport('inventory-pdf')}
            >
              <FileText size={15} />
              {exporting === 'inventory-pdf'
                ? 'Downloading...'
                : 'Inventory PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* No Shop Selected */}
      {!currentShop ? (
        <div
          style={{
            textAlign: 'center',
            padding: 60,
            color: '#9ca3af',
          }}
        >
          <p style={{ fontSize: 32, marginBottom: 8 }}>🏪</p>
          <p style={{ fontWeight: 500 }}>
            Please select a shop from the top bar
          </p>
        </div>
      ) : (
        <>
          {/* Top Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 20,
              marginBottom: 20,
            }}
          >
            {/* Daily Sales */}
            <div
              style={{
                background: 'white',
                borderRadius: 12,
                padding: 24,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 20,
                }}
              >
                <h2
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#1a3c5e',
                  }}
                >
                  Daily Sales
                </h2>

                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) =>
                    setTargetDate(e.target.value)
                  }
                  style={{
                    padding: '6px 10px',
                    border: '1.5px solid #e5e7eb',
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                />
              </div>

              {loadingDaily ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: 40,
                  }}
                >
                  <LoadingSpinner />
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      background: '#f9fafb',
                      borderRadius: 10,
                      padding: 16,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 12,
                        color: '#6b7280',
                        marginBottom: 6,
                      }}
                    >
                      Transactions
                    </p>

                    <p
                      style={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: '#1a3c5e',
                      }}
                    >
                      {dailySales?.total_transactions || 0}
                    </p>
                  </div>

                  <div
                    style={{
                      background: '#f9fafb',
                      borderRadius: 10,
                      padding: 16,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 12,
                        color: '#6b7280',
                        marginBottom: 6,
                      }}
                    >
                      Units Sold
                    </p>

                    <p
                      style={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: '#c9922a',
                      }}
                    >
                      {dailySales?.total_units_sold || 0}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Low Stock */}
            <div
              style={{
                background: 'white',
                borderRadius: 12,
                padding: 24,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 20,
                }}
              >
                <h2
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#1a3c5e',
                  }}
                >
                  Low Stock Alert
                </h2>

                <span
                  style={{
                    background:
                      lowStockData.length > 0
                        ? '#fef2f2'
                        : '#f0fdf4',
                    color:
                      lowStockData.length > 0
                        ? '#dc2626'
                        : '#16a34a',
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '2px 10px',
                    borderRadius: 20,
                  }}
                >
                  {lowStockData.length} items
                </span>
              </div>

              {loadingLowStock ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: 40,
                  }}
                >
                  <LoadingSpinner />
                </div>
              ) : lowStockData.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '32px 0',
                    color: '#9ca3af',
                  }}
                >
                  <p
                    style={{
                      fontSize: 28,
                      marginBottom: 8,
                    }}
                  >
                    ✅
                  </p>

                  <p style={{ fontWeight: 500 }}>
                    All stock levels OK
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    maxHeight: 200,
                    overflowY: 'auto',
                  }}
                >
                  {lowStockData.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 0',
                        borderBottom:
                          '1px solid #f3f4f6',
                      }}
                    >
                      <div>
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 500,
                            color: '#111827',
                          }}
                        >
                          {item.name}
                        </p>

                        <p
                          style={{
                            fontSize: 12,
                            color: '#9ca3af',
                          }}
                        >
                          {item.sku}
                        </p>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: '#dc2626',
                          }}
                        >
                          {item.quantity} left
                        </p>

                        <p
                          style={{
                            fontSize: 11,
                            color: '#9ca3af',
                          }}
                        >
                          min: {item.low_stock_threshold}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Trend Chart */}
          <div
            style={{
              background: 'white',
              borderRadius: 12,
              padding: 24,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <h2
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: '#1a3c5e',
                marginBottom: 20,
              }}
            >
              Sales Volume — Last 30 Days
            </h2>

            {loadingTrend ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: 60,
                }}
              >
                <LoadingSpinner />
              </div>
            ) : trendData.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '48px 0',
                  color: '#9ca3af',
                }}
              >
                <p
                  style={{
                    fontSize: 32,
                    marginBottom: 8,
                  }}
                >
                  📊
                </p>

                <p>No sales data yet</p>
              </div>
            ) : (
              <ResponsiveContainer
                width="100%"
                height={280}
              >
                <BarChart
                  data={trendData}
                  margin={{
                    top: 5,
                    right: 20,
                    bottom: 5,
                    left: 0,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />

                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 11,
                      fill: '#9ca3af',
                    }}
                    tickFormatter={(d) => d.slice(5)}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 11,
                      fill: '#9ca3af',
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                    }}
                    formatter={(value) => [
                      value,
                      'Units Sold',
                    ]}
                  />

                  <Bar
                    dataKey="units_sold"
                    fill="#1a3c5e"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;