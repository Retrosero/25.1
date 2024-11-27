import { Trash2, Upload, Camera } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useState } from 'react';

type PaymentRowProps = {
  type: 'nakit' | 'cek' | 'senet' | 'krediKarti' | 'havale';
  onDelete: () => void;
  onChange: (data: any) => void;
  data: any;
};

export function PaymentRow({ type, onDelete, onChange, data }: PaymentRowProps) {
  const [images, setImages] = useState<string[]>(data.images || []);

  const handleChange = (field: string, value: string | string[]) => {
    onChange({ ...data, [field]: value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.map(file => URL.createObjectURL(file));
    const updatedImages = [...images, ...newImages];
    setImages(updatedImages);
    handleChange('images', updatedImages);
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);

      const imageUrl = canvas.toDataURL('image/jpeg');
      const updatedImages = [...images, imageUrl];
      setImages(updatedImages);
      handleChange('images', updatedImages);

      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Camera capture failed:', error);
    }
  };

  const renderFields = () => {
    switch (type) {
      case 'nakit':
        return (
          <input
            type="number"
            value={data.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            placeholder="Tutar"
            className="w-32 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          />
        );

      case 'krediKarti':
      case 'havale':
        return (
          <div className="flex gap-2">
            <input
              type="text"
              value={data.bank}
              onChange={(e) => handleChange('bank', e.target.value)}
              placeholder="Banka Adı"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
            <input
              type="number"
              value={data.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              placeholder="Tutar"
              className="w-32 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>
        );

      case 'cek':
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={data.bank}
                onChange={(e) => handleChange('bank', e.target.value)}
                placeholder="Banka Adı"
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                required
              />
              <input
                type="text"
                value={data.branch}
                onChange={(e) => handleChange('branch', e.target.value)}
                placeholder="Şube Adı"
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                required
              />
              <input
                type="text"
                value={data.checkNumber}
                onChange={(e) => handleChange('checkNumber', e.target.value)}
                placeholder="Çek Numarası"
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                required
              />
              <input
                type="text"
                value={data.accountNumber}
                onChange={(e) => handleChange('accountNumber', e.target.value)}
                placeholder="Hesap Numarası"
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                required
              />
              <input
                type="number"
                value={data.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                placeholder="Tutar"
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                required
              />
              <input
                type="date"
                value={data.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                required
              />
            </div>
            <div className="flex gap-2">
              <label className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer">
                <Upload className="w-5 h-5" />
                <span>Fotoğraf Ekle</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  multiple
                />
              </label>
              <button
                onClick={handleCameraCapture}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Camera className="w-5 h-5" />
                <span>Fotoğraf Çek</span>
              </button>
            </div>
            {images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto py-2">
                {images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Çek ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
          </div>
        );

      case 'senet':
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={data.debtorName}
                onChange={(e) => handleChange('debtorName', e.target.value)}
                placeholder="Borçlu Adı"
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                required
              />
              <input
                type="text"
                value={data.debtorId}
                onChange={(e) => handleChange('debtorId', e.target.value)}
                placeholder="TC/VKN"
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                required
              />
              <input
                type="text"
                value={data.bondNumber}
                onChange={(e) => handleChange('bondNumber', e.target.value)}
                placeholder="Senet Numarası"
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                required
              />
              <input
                type="number"
                value={data.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                placeholder="Tutar"
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                required
              />
              <input
                type="date"
                value={data.issueDate}
                onChange={(e) => handleChange('issueDate', e.target.value)}
                placeholder="Düzenleme Tarihi"
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                required
              />
              <input
                type="date"
                value={data.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                placeholder="Vade Tarihi"
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                required
              />
            </div>
            <div className="flex gap-2">
              <label className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer">
                <Upload className="w-5 h-5" />
                <span>Fotoğraf Ekle</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  multiple
                />
              </label>
              <button
                onClick={handleCameraCapture}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Camera className="w-5 h-5" />
                <span>Fotoğraf Çek</span>
              </button>
            </div>
            {images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto py-2">
                {images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Senet ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex items-start gap-2 mb-2">
      {renderFields()}
      <button
        onClick={onDelete}
        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
}