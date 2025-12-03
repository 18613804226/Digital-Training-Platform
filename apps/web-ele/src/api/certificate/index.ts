// certificate
import { fileRequestClient, requestClient } from '#/api/request';

/**
 *
 */
export async function getCertificategApi(params: any) {
  return requestClient.get<any>('/certificates', { params });
}
export async function createCertificategApi(params: any) {
  return requestClient.post<any>('/certificates', { params });
}
export async function deleteCertificategApi(id: string) {
  return requestClient.delete<any>(`/certificates/${id}`);
}
export async function previewCertificatePdf(
  id: number | string,
): Promise<Blob> {
  const response = await fileRequestClient.get(
    `/certificates/${id}/pdf/preview`,
    {
      responseType: 'blob', // ⭐️ 关键：告诉 axios 这是二进制数据
      headers: {
        Accept: 'application/pdf',
      },
    },
  );
  return response.data; // 返回 Blob
}
export async function downloadCertificatePdf(
  id: number | string,
): Promise<Blob> {
  const response = await fileRequestClient.get(
    `/certificates/${id}/pdf/download`,
    {
      responseType: 'blob', // ⭐️ 关键：告诉 axios 这是二进制数据
      headers: {
        Accept: 'application/pdf',
      },
    },
  );
  return response.data; // 返回 Blob
}
