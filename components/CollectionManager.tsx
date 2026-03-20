import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderPlus, X, Check, Trash2, Edit3, Folder, Plus, ChevronRight } from 'lucide-react';

interface Collection {
  id: string;
  name: string;
  projectCount: number;
}

interface CollectionManagerProps {
  isOpen: boolean;
  onClose: () => void;
  collections: Collection[];
  onCreateCollection: (name: string) => void;
  onDeleteCollection: (id: string) => void;
  onRenameCollection: (id: string, newName: string) => void;
  onAddToCollection: (collectionId: string) => void;
  projectName?: string;
}

export const CollectionManager: React.FC<CollectionManagerProps> = ({
  isOpen,
  onClose,
  collections,
  onCreateCollection,
  onDeleteCollection,
  onRenameCollection,
  onAddToCollection,
  projectName
}) => {
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreate = () => {
    if (newCollectionName.trim()) {
      onCreateCollection(newCollectionName.trim());
      setNewCollectionName('');
      setIsCreating(false);
    }
  };

  const handleRename = (id: string) => {
    if (editName.trim()) {
      onRenameCollection(id, editName.trim());
      setEditingId(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[101] px-4"
          >
            <div className="bg-[#0f172a]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-orange-500/10 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-xl">
                    <FolderPlus className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">
                      {projectName ? `Add to Collection` : `Manage Collections`}
                    </h3>
                    {projectName && (
                      <p className="text-[10px] text-gray-400 font-medium">Adding: {projectName}</p>
                    )}
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto no-scrollbar">
                {collections.length === 0 && !isCreating && (
                  <div className="text-center py-10 space-y-4">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5">
                      <Folder className="w-8 h-8 text-gray-600" />
                    </div>
                    <p className="text-xs text-gray-500 font-medium">No collections yet. Create one to organize your research.</p>
                  </div>
                )}

                <div className="space-y-2">
                  {collections.map((col) => (
                    <div
                      key={col.id}
                      className="group flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-orange-500/30 transition-all"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Folder className="w-4 h-4 text-orange-500/50 group-hover:text-orange-500 transition-colors" />
                        {editingId === col.id ? (
                          <input
                            autoFocus
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleRename(col.id)}
                            className="bg-transparent text-xs font-bold text-white border-b border-orange-500 focus:outline-none flex-1"
                          />
                        ) : (
                          <div 
                            className="flex-1 cursor-pointer"
                            onClick={() => projectName && onAddToCollection(col.id)}
                          >
                            <span className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors block truncate">
                              {col.name}
                            </span>
                            <span className="text-[8px] text-gray-600 uppercase font-black">{col.projectCount} Projects</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {editingId === col.id ? (
                          <button onClick={() => handleRename(col.id)} className="p-1.5 hover:bg-green-500/20 text-green-500 rounded-lg">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <>
                            {projectName ? (
                              <button 
                                onClick={() => onAddToCollection(col.id)}
                                className="p-1.5 hover:bg-orange-500/20 text-orange-500 rounded-lg flex items-center gap-1"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-black uppercase">Add</span>
                              </button>
                            ) : (
                              <>
                                <button 
                                  onClick={() => { setEditingId(col.id); setEditName(col.name); }}
                                  className="p-1.5 hover:bg-white/10 text-gray-400 rounded-lg"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => onDeleteCollection(col.id)}
                                  className="p-1.5 hover:bg-red-500/10 text-red-500/50 hover:text-red-500 rounded-lg"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <AnimatePresence>
                  {isCreating ? (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-2xl bg-orange-500/5 border border-orange-500/20"
                    >
                      <input
                        autoFocus
                        placeholder="Collection name (e.g. AI Tools)"
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        className="w-full bg-transparent text-xs font-bold text-white placeholder:text-gray-600 focus:outline-none mb-3"
                      />
                      <div className="flex justify-end gap-2 text-[10px] font-black uppercase">
                        <button onClick={() => setIsCreating(false)} className="px-3 py-1.5 text-gray-500 hover:text-gray-300 transition-colors">Cancel</button>
                        <button onClick={handleCreate} className="px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">Create</button>
                      </div>
                    </motion.div>
                  ) : (
                    <button
                      onClick={() => setIsCreating(true)}
                      className="w-full p-3 rounded-2xl border border-dashed border-white/10 hover:border-orange-500/30 text-gray-500 hover:text-orange-500 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">New Collection</span>
                    </button>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-6 bg-white/[0.02] border-t border-white/5">
                <p className="text-[9px] text-gray-600 font-bold text-center uppercase tracking-widest leading-relaxed">
                  Your collections are synced across all devices via <span className="text-orange-500/50">Techboy Cloud</span>
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
