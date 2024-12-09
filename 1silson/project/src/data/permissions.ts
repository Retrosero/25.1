import { Permission } from '../types/user';

export const permissions: Permission[] = [
  // Satış İzinleri
  {
    id: 'sales.create',
    name: 'Satış Oluşturma',
    description: 'Yeni satış işlemi oluşturabilir',
    module: 'sales'
  },
  {
    id: 'sales.view',
    name: 'Satışları Görüntüleme',
    description: 'Tüm satışları görüntüleyebilir',
    module: 'sales'
  },
  {
    id: 'sales.edit',
    name: 'Satış Düzenleme',
    description: 'Mevcut satışları düzenleyebilir',
    module: 'sales'
  },

  // Onay İzinleri
  {
    id: 'approvals.view',
    name: 'Onayları Görüntüleme',
    description: 'Onay bekleyen işlemleri görüntüleyebilir',
    module: 'approvals'
  },
  {
    id: 'approvals.approve',
    name: 'Onay Verme',
    description: 'İşlemleri onaylayabilir veya reddedebilir',
    module: 'approvals'
  },

  // Müşteri İzinleri
  {
    id: 'customers.view',
    name: 'Müşterileri Görüntüleme',
    description: 'Müşteri listesini görüntüleyebilir',
    module: 'customers'
  },
  {
    id: 'customers.create',
    name: 'Müşteri Oluşturma',
    description: 'Yeni müşteri ekleyebilir',
    module: 'customers'
  },
  {
    id: 'customers.edit',
    name: 'Müşteri Düzenleme',
    description: 'Müşteri bilgilerini düzenleyebilir',
    module: 'customers'
  },
  {
    id: 'customers.delete',
    name: 'Müşteri Silme',
    description: 'Müşterileri silebilir',
    module: 'customers'
  },

  // Sipariş İzinleri
  {
    id: 'orders.view',
    name: 'Siparişleri Görüntüleme',
    description: 'Sipariş listesini görüntüleyebilir',
    module: 'orders'
  },
  {
    id: 'orders.prepare',
    name: 'Sipariş Hazırlama',
    description: 'Siparişleri hazırlayabilir',
    module: 'orders'
  },
  {
    id: 'orders.deliver',
    name: 'Sipariş Teslim',
    description: 'Siparişleri teslim edebilir',
    module: 'orders'
  },

  // Ödeme İzinleri
  {
    id: 'payments.create',
    name: 'Ödeme Alma',
    description: 'Tahsilat yapabilir',
    module: 'payments'
  },
  {
    id: 'payments.view',
    name: 'Ödemeleri Görüntüleme',
    description: 'Ödeme geçmişini görüntüleyebilir',
    module: 'payments'
  },

  // Rapor İzinleri
  {
    id: 'reports.view',
    name: 'Raporları Görüntüleme',
    description: 'Raporları görüntüleyebilir',
    module: 'reports'
  },
  {
    id: 'reports.export',
    name: 'Rapor Dışa Aktarma',
    description: 'Raporları dışa aktarabilir',
    module: 'reports'
  },

  // Ayar İzinleri
  {
    id: 'settings.view',
    name: 'Ayarları Görüntüleme',
    description: 'Sistem ayarlarını görüntüleyebilir',
    module: 'settings'
  },
  {
    id: 'settings.edit',
    name: 'Ayarları Düzenleme',
    description: 'Sistem ayarlarını düzenleyebilir',
    module: 'settings'
  },

  // Kullanıcı İzinleri
  {
    id: 'users.manage',
    name: 'Kullanıcı Yönetimi',
    description: 'Kullanıcıları yönetebilir',
    module: 'settings'
  },

  // Dashboard İzinleri
  {
    id: 'dashboard.view',
    name: 'Dashboard Görüntüleme',
    description: 'Dashboard sayfasını görüntüleyebilir',
    module: 'dashboard'
  },

  // Bildirim İzinleri
  {
    id: 'notifications.view',
    name: 'Bildirimleri Görüntüleme',
    description: 'Bildirimleri görüntüleyebilir',
    module: 'settings'
  },

  // Envanter İzinleri
  {
    id: 'inventory.view',
    name: 'Envanter Görüntüleme',
    description: 'Envanter listesini görüntüleyebilir',
    module: 'inventory'
  },
  {
    id: 'inventory.count',
    name: 'Sayım Yapma',
    description: 'Envanter sayımı yapabilir',
    module: 'inventory'
  },

  // İade İzinleri
  {
    id: 'returns.create',
    name: 'İade Alma',
    description: 'İade işlemi yapabilir',
    module: 'returns'
  },
  {
    id: 'returns.view',
    name: 'İadeleri Görüntüleme',
    description: 'İade listesini görüntüleyebilir',
    module: 'returns'
  },

  // Takvim İzinleri
  {
    id: 'calendar.view',
    name: 'Takvim Görüntüleme',
    description: 'Takvim sayfasını görüntüleyebilir',
    module: 'calendar'
  },

  // Görev İzinleri
  {
    id: 'todos.create',
    name: 'Görev Oluşturma',
    description: 'Yeni görev oluşturabilir',
    module: 'todos'
  },
  {
    id: 'todos.view',
    name: 'Görevleri Görüntüleme',
    description: 'Görev listesini görüntüleyebilir',
    module: 'todos'
  },
  {
    id: 'todos.edit',
    name: 'Görev Düzenleme',
    description: 'Görevleri düzenleyebilir',
    module: 'todos'
  },
  {
    id: 'todos.delete',
    name: 'Görev Silme',
    description: 'Görevleri silebilir',
    module: 'todos'
  }
];