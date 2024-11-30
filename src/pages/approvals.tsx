import { useState, useRef } from 'react';
import { Search, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApprovals, ApprovalStatus, ApprovalType } from '../hooks/use-approvals';
import { useAccessRequests } from '../hooks/use-access-requests';
import { useAuth } from '../hooks/use-auth';
import { formatCurrency } from '../lib/utils';
import { cn } from '../lib/utils';
import { ApprovalDetail } from '../components/approvals/approval-detail';

const tabs: { id: TabType; label: string }[] = [
  { id: 'all', label: 'Tümü' },
  { id: 'sales', label: 'Satışlar' },
  { id: 'payments', label: 'Tahsilatlar' },
  { id: 'expenses', label: 'Tediyeler' },
  { id: 'returns', label: 'İadeler' },
  { id: 'products', label: 'Ürün Değişiklikleri' },
  { id: 'orders', label: 'Siparişler' },
  { id: 'inventory', label: 'Sayım' },
  { id: 'access', label: 'Erişim İstekleri' },
];

type TabType = 'all' | 'sales' | 'payments' | 'expenses' | 'returns' | 'products' | 'orders' | 'inventory' | 'access';

export function ApprovalsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ApprovalStatus>('pending');
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const { approvals, updateApprovalStatus } = useApprovals();
  const { requests, updateRequestStatus } = useAccessRequests();
  const { user } = useAuth();
  const tabsRef = useRef<HTMLDivElement>(null);

  // Only show access tab for admin
  const availableTabs = tabs.filter(tab => 
    tab.id !== 'access' || user?.role === 'admin'
  );

  const pendingCounts = {
    all: approvals.filter(a => a.status === 'pending').length,
    sales: approvals.filter(a => a.status === 'pending' && a.type === 'sale').length,
    payments: approvals.filter(a => a.status === 'pending' && a.type === 'payment').length,
    expenses: approvals.filter(a => a.status === 'pending' && a.type === 'expense').length,
    returns: approvals.filter(a => a.status === 'pending' && a.type === 'return').length,
    products: approvals.filter(a => a.status === 'pending' && a.type === 'product').length,
    orders: approvals.filter(a => a.status === 'pending' && a.type === 'order_change').length,
    inventory: approvals.filter(a => a.status === 'pending' && a.type === 'inventory').length,
    access: requests.filter(r => r.status === 'pending').length,
  };

  const filteredApprovals = approvals
    .filter(approval => 
      activeTab === 'all' || 
      (activeTab === 'sales' && approval.type === 'sale') ||
      (activeTab === 'payments' && approval.type === 'payment') ||
      (activeTab === 'expenses' && approval.type === 'expense') ||
      (activeTab === 'returns' && approval.type === 'return') ||
      (activeTab === 'products' && approval.type === 'product') ||
      (activeTab === 'orders' && approval.type === 'order_change') ||
      (activeTab === 'inventory' && approval.type === 'inventory')
    )
    .filter(approval => approval.status === selectedStatus)
    .filter(approval =>
      !searchQuery ||
      approval.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.customer?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleScroll = (direction: 'left' | 'right') => {
    if (!tabsRef.current) return;
    
    const scrollAmount = 200;
    const container = tabsRef.current;
    
    if (direction === 'left') {
      container.scrollLeft -= scrollAmount;
    } else {
      container.scrollLeft += scrollAmount;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Onay Bekleyenler</h1>
      </div>

      <div className="flex items-center gap-2 mb-6 relative">
        <button
          onClick={() => handleScroll('left')}
          className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm z-10"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div 
          ref={tabsRef}
          className="flex-1 overflow-x-auto scrollbar-hide"
          style={{ scrollBehavior: 'smooth' }}
        >
          <div className="flex gap-2 min-w-max px-2 py-1">
            {availableTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-4 py-2 rounded-lg relative whitespace-nowrap min-w-[120px]',
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                )}
              >
                {tab.label}
                {pendingCounts[tab.id] > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center z-20">
                    {pendingCounts[tab.id]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => handleScroll('right')}
          className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm z-10"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Onay ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 h-10 rounded-lg border border-gray-200 dark:border-gray-700"
          />
        </div>

        <div className="flex gap-2">
          {(['pending', 'approved', 'rejected'] as ApprovalStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={cn(
                'px-4 py-2 rounded-lg',
                selectedStatus === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
              )}
            >
              {status === 'pending' ? 'Bekleyenler' :
               status === 'approved' ? 'Onaylananlar' :
               'Reddedilenler'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'access' ? (
        <div className="space-y-4">
          {requests
            .filter(request => request.status === selectedStatus)
            .filter(request =>
              !searchQuery ||
              request.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              request.permissionName.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((request) => (
              <div
                key={request.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{request.userName}</h3>
                      <span className={cn(
                        'px-2 py-0.5 text-xs rounded-full',
                        request.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : request.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      )}>
                        {request.status === 'pending' ? 'Bekliyor' :
                         request.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {request.permissionName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(request.requestDate).toLocaleString('tr-TR')}
                    </p>
                  </div>
                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateRequestStatus(request.id, 'approved', user?.name || '')}
                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/50 rounded-lg"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => updateRequestStatus(request.id, 'rejected', user?.name || '')}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
                {request.note && (
                  <p className="text-sm text-gray-500 mt-2">Not: {request.note}</p>
                )}
                {request.responseDate && (
                  <div className="mt-2 text-sm">
                    <p className="text-gray-500">
                      Yanıtlayan: {request.respondedBy}
                    </p>
                    <p className="text-gray-500">
                      Yanıt Tarihi: {new Date(request.responseDate).toLocaleString('tr-TR')}
                    </p>
                  </div>
                )}
              </div>
            ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApprovals.map((approval) => (
            <div
              key={approval.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => setSelectedApproval(approval)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'px-2 py-0.5 text-xs rounded-full',
                      approval.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : approval.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    )}>
                      {approval.status === 'pending' ? 'Bekliyor' :
                       approval.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(approval.date).toLocaleString('tr-TR')}
                    </span>
                  </div>
                  <p className="font-medium mt-1">{approval.description}</p>
                  <p className="text-sm text-gray-500">İsteyen: {approval.user}</p>
                </div>
                {approval.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateApprovalStatus(approval.id, 'approved');
                      }}
                      className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/50 rounded-lg"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateApprovalStatus(approval.id, 'rejected');
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              {selectedApproval?.id === approval.id && (
                <ApprovalDetail approval={approval} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Onay Detay Popup */}
      {selectedApproval && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="font-medium">Onay Detayı</h3>
                <p className="text-sm text-gray-500">
                  {new Date(selectedApproval.date).toLocaleString('tr-TR')}
                </p>
              </div>
              <button
                onClick={() => setSelectedApproval(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <ApprovalDetail approval={selectedApproval} />
            </div>

            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
              {selectedApproval.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      updateApprovalStatus(selectedApproval.id, 'rejected');
                      setSelectedApproval(null);
                    }}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg"
                  >
                    Reddet
                  </button>
                  <button
                    onClick={() => {
                      updateApprovalStatus(selectedApproval.id, 'approved');
                      setSelectedApproval(null);
                    }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Onayla
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}