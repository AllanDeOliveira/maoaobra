// src/services/storageService.js — Upload e gerenciamento de arquivos no Firebase Storage
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Faz upload de um arquivo para o Firebase Storage com acompanhamento de progresso.
 * @param {File} file - Arquivo selecionado pelo usuário.
 * @param {string} path - Caminho de destino no Storage (ex: 'avatars/uid/foto.jpg').
 * @param {function} onProgress - Callback com a porcentagem de progresso (0-100).
 * @returns {Promise<string>} URL pública de download do arquivo.
 */
export async function uploadFileToStorage(file, path, onProgress = null) {
  if (!file) throw new Error("Nenhum arquivo fornecido para upload.");

  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (onProgress && snapshot.totalBytes > 0) {
          const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(Math.round(percent));
        }
      },
      (error) => {
        console.error("Erro no upload do Firebase Storage:", error);
        reject(error);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

/**
 * Remove um arquivo do Firebase Storage a partir da sua URL ou caminho.
 */
export async function deleteFileFromStorage(pathOrUrl) {
  try {
    const fileRef = ref(storage, pathOrUrl);
    await deleteObject(fileRef);
  } catch (error) {
    console.warn("Aviso ao deletar arquivo do Storage:", error);
  }
}
