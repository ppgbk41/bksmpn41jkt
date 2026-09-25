'use client';

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Clock, Plus, CheckCircle2, UserCheck, X, Upload, Image as ImageIcon, AlertCircle, Eye } from 'lucide-react';

export default function TindakLanjutPage() {
  const [user, setUser] = useState<any>(null);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Student & Class state
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');

  // Image upload state
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docPreviewUrl, setDocPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Preview documentation modal
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    studentId: '',
    type: 'Home Visit',
    scheduleDate: new Date().toISOString().split('T')[0],
    involvedParties: 'Guru BK & Wali Kelas',
    monitoringResult: '',
    conditionChange: ''
  });

  useEffect(() => {
    fetchSessionAndFollowUps();
    fetchStudentsAndClasses();
  }, []);

  const fetchSessionAndFollowUps = async () => {
    try {
      const sessionRes = await fetch('/api/auth/me');
      if (sessionRes.ok) {
        const sData = await sessionRes.json();
        setUser(sData.user);
      }

      const res = await fetch('/api/konseling/tindak-lanjut');
      if (res.ok) {
        const data = await res.json();
        setFollowUps(data.followUps || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsAndClasses = async () => {
    try {
      const [siswaRes, kelasRes] = await Promise.all([
        fetch('/api/siswa'),
        fetch('/api/kelas')
      ]);

      if (siswaRes.ok) {
        const sData = await siswaRes.json();
        setStudents(sData.students || []);
      }

      if (kelasRes.ok) {
        const kData = await kelasRes.json();
        setClasses(kData.classes || []);
      }
    } catch (e) {
      console.error('Error fetching students or classes:', e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);

    if (!file) {
      setDocFile(null);
      setDocPreviewUrl(null);
      return;
    }

    // Validation 1: Max 1 MB (1 * 1024 * 1024 bytes)
    const MAX_SIZE = 1 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setUploadError(`Ukuran foto terlalu besar (${sizeMB} MB). Maksimal 1 MB.`);
      e.target.value = '';
      setDocFile(null);
      setDocPreviewUrl(null);
      return;
    }

    // Validation 2: Image formats (JPG, JPEG, PNG, WEBP)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Format berkas tidak didukung. Harap gunakan format JPG, JPEG, PNG, atau WEBP.');
      e.target.value = '';
      setDocFile(null);
      setDocPreviewUrl(null);
      return;
    }

    setDocFile(file);
    setDocPreviewUrl(URL.createObjectURL(file));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId) {
      alert('Pilih nama murid terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    try {
      let uploadedDocUrl = '';

      // Upload file first if selected
      if (docFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', docFile);

        const uploadRes = await fetch('/api/konseling/tindak-lanjut/upload', {
          method: 'POST',
          body: uploadFormData
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          alert(uploadData.error || 'Gagal mengunggah foto dokumentasi.');
          setIsSubmitting(false);
          return;
        }

        uploadedDocUrl = uploadData.imageUrl;
      }

      // Submit form
      const res = await fetch('/api/konseling/tindak-lanjut', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          documentationUrl: uploadedDocUrl
        })
      });

      if (res.ok) {
        setShowAddModal(false);
        // Reset form
        setFormData({
          studentId: '',
          type: 'Home Visit',
          scheduleDate: new Date().toISOString().split('T')[0],
          involvedParties: 'Guru BK & Wali Kelas',
          monitoringResult: '',
          conditionChange: ''
        });
        setSelectedClass('');
        setDocFile(null);
        setDocPreviewUrl(null);
        setUploadError(null);
        fetchSessionAndFollowUps();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Gagal menambah agenda tindak lanjut');
      }
    } catch (e: any) {
      alert('Terjadi kesalahan: ' + (e?.message || 'Server error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter students based on selected class
  const filteredStudents = selectedClass
    ? students.filter(s => s.currentClass === selectedClass)
    : students;

  const selectedStudentObj = students.find(s => s.id === formData.studentId);

  return (
    <MainLayout user={user}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Pemantauan & Tindak Lanjut Konseling</h1>
            <p className="text-xs text-slate-500 mt-1">
              Tracking pelaksanaan Home Visit, Pertemuan Ortu, Konferensi Kasus, dan Rujukan Ahli.
            </p>
          </div>

          {['ADMIN', 'GURU_BK'].includes(user?.role) && (
            <button
              onClick={() => {
                setShowAddModal(true);
                setUploadError(null);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              Agenda Tindak Lanjut Baru
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Tanggal Agenda</th>
                  <th className="p-4">Peserta Didik</th>
                  <th className="p-4">Jenis Tindak Lanjut</th>
                  <th className="p-4">Pihak Terlibat</th>
                  <th className="p-4">Hasil Pemantauan</th>
                  <th className="p-4 text-center">Dokumentasi</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-400">Memuat agenda tindak lanjut...</td></tr>
                ) : followUps.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-400">Belum ada agenda tindak lanjut.</td></tr>
                ) : (
                  followUps.map((f, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">{f.scheduleDate}</td>
                      <td className="p-4">
                        <p className="font-bold text-slate-900 dark:text-slate-100">{f.student?.name || '-'}</p>
                        <p className="text-[10px] text-slate-500">Kelas: {f.student?.currentClass?.name || '-'}</p>
                      </td>
                      <td className="p-4 font-semibold text-blue-600 dark:text-blue-400">{f.type}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">{f.involvedParties}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">{f.monitoringResult || '-'}</td>
                      <td className="p-4 text-center">
                        {f.documentationUrl ? (
                          <button
                            onClick={() => setPreviewImage(f.documentationUrl)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg text-[11px] transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-500" />
                            Foto
                          </button>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Tanpa foto</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold rounded-full">
                          {f.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Add Follow Up */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Tambah Agenda Tindak Lanjut</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              {/* Filter Kelas */}
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Pilih Kelas</label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setFormData(prev => ({ ...prev, studentId: '' }));
                  }}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">-- Semua Kelas --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.name}>Kelas {c.name}</option>
                  ))}
                </select>
              </div>

              {/* Pilih Nama Murid */}
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Nama Murid & Kelas <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">-- Pilih Murid --</option>
                  {filteredStudents.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} - (Kelas {s.currentClass})
                    </option>
                  ))}
                </select>
                {selectedStudentObj && (
                  <div className="mt-2 p-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl flex items-center justify-between text-blue-900 dark:text-blue-200">
                    <div>
                      <p className="font-bold">{selectedStudentObj.name}</p>
                      <p className="text-[11px] opacity-80">Kelas: {selectedStudentObj.currentClass} | NIS: {selectedStudentObj.nis || '-'}</p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
              </div>

              {/* Jenis Tindak Lanjut */}
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Jenis Tindak Lanjut <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="Home Visit">Home Visit (Kunjungan Rumah)</option>
                  <option value="Pertemuan Orang Tua">Pertemuan Orang Tua / Wali</option>
                  <option value="Konsultasi Wali Kelas">Konsultasi Wali Kelas</option>
                  <option value="Konferensi Kasus">Konferensi Kasus</option>
                  <option value="Rujukan Ahli">Rujukan Ahli (Psikolog / Dokter)</option>
                  <option value="Pemantauan Berkala">Pemantauan Berkala</option>
                </select>
              </div>

              {/* Jadwal Tanggal */}
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Jadwal Tanggal <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.scheduleDate}
                  onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                />
              </div>

              {/* Pihak yang Terlibat */}
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Pihak yang Terlibat <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.involvedParties}
                  onChange={(e) => setFormData({ ...formData, involvedParties: e.target.value })}
                  placeholder="Contoh: Guru BK, Wali Kelas, Orang Tua"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Upload Dokumentasi Kegiatan */}
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Upload Dokumentasi Kegiatan (Foto)
                </label>
                <div className="mt-1 flex flex-col gap-2">
                  <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-4 transition-colors text-center bg-slate-50 dark:bg-slate-800/50">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <Upload className="w-6 h-6 text-blue-500" />
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        Klik atau seret foto ke sini
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Format: JPG, JPEG, PNG, WEBP (Maksimal 1 MB)
                      </p>
                    </div>
                  </div>

                  {uploadError && (
                    <div className="flex items-center gap-1.5 p-2.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl text-red-600 dark:text-red-300 text-xs font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {docPreviewUrl && (
                    <div className="relative mt-1 p-2 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center gap-3 border border-slate-200 dark:border-slate-700">
                      <img
                        src={docPreviewUrl}
                        alt="Preview Dokumentasi"
                        className="w-16 h-16 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate text-slate-800 dark:text-slate-200">{docFile?.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {docFile ? (docFile.size / 1024).toFixed(1) + ' KB' : ''}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setDocFile(null);
                          setDocPreviewUrl(null);
                        }}
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold rounded-xl text-slate-600 dark:text-slate-300 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Agenda'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Preview Foto Dokumentasi */}
      {previewImage && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 max-w-2xl w-full shadow-2xl relative">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="font-bold text-sm mb-3 text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-blue-500" />
              Dokumentasi Kegiatan
            </h4>
            <div className="rounded-2xl overflow-hidden bg-black/5 dark:bg-black/40 flex items-center justify-center max-h-[70vh]">
              <img
                src={previewImage}
                alt="Dokumentasi Kegiatan"
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
