import { useState, useRef } from 'react';
import { Plus, X, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { ProductImage } from '../../hooks/use-products';

interface ImageManagerProps {
  images?: ProductImage[];
  onAddImage: (url: string) => void;
  onAddFile: (file: File) => void;
  onRemoveImage: (id: string) => void;
  onReorderImages: (imageIds: string[]) => void;
}

export function ImageManager({
  images = [],
  onAddImage,
  onAddFile,
  onRemoveImage,
  onReorderImages,
}: ImageManagerProps) {
  const [newImageUrl, setNewImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sortedImages = [...images].sort((a, b) => a.order - b.order);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(sortedImages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onReorderImages(items.map(item => item.id));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAddFile(file);
      // Clear the input so the same file can be selected again
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="font-medium mb-4">Resim Sıralaması</h3>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="images">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2"
              >
                {sortedImages.map((image, index) => (
                  <Draggable key={image.id} draggableId={image.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                      >
                        <div {...provided.dragHandleProps} className="cursor-move">
                          <GripVertical className="w-5 h-5 text-gray-400" />
                        </div>
                        <img
                          src={image.url}
                          alt=""
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={image.url}
                            readOnly
                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                          />
                        </div>
                        <button
                          onClick={() => onRemoveImage(image.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg"
                          title="Resmi Sil"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="font-medium mb-4">Yeni Resim Ekle</h3>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Resim URL'si girin"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
            />
            <button
              onClick={() => {
                if (newImageUrl) {
                  onAddImage(newImageUrl);
                  setNewImageUrl('');
                }
              }}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="relative">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:border-primary-500 hover:text-primary-500 transition-colors"
            >
              Bilgisayardan Resim Yükle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}