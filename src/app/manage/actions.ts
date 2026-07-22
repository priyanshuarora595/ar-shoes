'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { managerFetch } from '@/lib/managerApi';
import { MANAGER_TOKEN_COOKIE } from '@/lib/managerAuthCookie';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';

export interface ActionState {
  error: string | null;
}

// An unchecked HTML checkbox simply omits its field from FormData - for a
// PATCH (partial update) that would mean "leave it alone" instead of the
// intended "set to false", so every submit must explicitly say true/false.
function normalizeCheckbox(formData: FormData, field: string) {
  formData.set(field, formData.has(field) ? 'true' : 'false');
}

// A <input type="file"> the user didn't touch still submits a zero-byte
// File - unlike a missing field, Django's FileField sees this and rejects
// it ("submitted file is empty") instead of treating it as "unchanged".
// Next.js's Server Action encoding also renders the empty file's name as
// the literal string "undefined" rather than "", so check for both.
function stripEmptyFiles(formData: FormData, fields: string[]) {
  for (const field of fields) {
    const value = formData.get(field);
    if (value instanceof File && value.size === 0 && (value.name === '' || value.name === 'undefined')) {
      formData.delete(field);
    }
  }
}

async function parseError(res: Response): Promise<string> {
  const data = await res.json().catch(() => null);
  if (!data) return `Request failed (${res.status})`;
  if (data.detail) return data.detail;
  return Object.entries(data)
    .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
    .join(' | ');
}

export async function loginAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const res = await fetch(`${API_BASE_URL}/api/admin/auth/login/`, {
    method: 'POST',
    body: new URLSearchParams({
      username: String(formData.get('username') || ''),
      password: String(formData.get('password') || ''),
    }),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (!res.ok) {
    return { error: await parseError(res) };
  }

  const data = await res.json();
  const cookieStore = await cookies();
  cookieStore.set(MANAGER_TOKEN_COOKIE, data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect('/manage/products');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(MANAGER_TOKEN_COOKIE);
  redirect('/manage/login');
}

export async function createProductAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  normalizeCheckbox(formData, 'is_active');

  const res = await managerFetch('/api/admin/products/', { method: 'POST', body: formData });
  if (!res.ok) {
    return { error: await parseError(res) };
  }
  const product = await res.json();
  revalidatePath('/manage/products');
  redirect(`/manage/products/${product.id}/edit`);
}

export async function updateProductAction(
  productId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  normalizeCheckbox(formData, 'is_active');
  stripEmptyFiles(formData, ['thumbnail']);

  const res = await managerFetch(`/api/admin/products/${productId}/`, { method: 'PATCH', body: formData });
  if (!res.ok) {
    return { error: await parseError(res) };
  }
  revalidatePath('/manage/products');
  revalidatePath(`/manage/products/${productId}/edit`);
  return { error: null };
}

export async function deleteProductAction(productId: string) {
  const res = await managerFetch(`/api/admin/products/${productId}/`, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  revalidatePath('/manage/products');
  redirect('/manage/products');
}

export async function createVariantAction(
  productId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // No is_active checkbox in AddVariantForm by design (new variants should
  // just default active) - unlike updateVariantAction, don't normalize it
  // here, or an absent field would be force-set to false instead of
  // falling back to the serializer's default=True.
  formData.set('product', productId);

  const res = await managerFetch('/api/admin/variants/', { method: 'POST', body: formData });
  if (!res.ok) {
    return { error: await parseError(res) };
  }
  revalidatePath(`/manage/products/${productId}/edit`);
  return { error: null };
}

export async function updateVariantAction(
  variantId: string,
  productId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  normalizeCheckbox(formData, 'is_active');
  stripEmptyFiles(formData, ['thumbnail', 'deepar_effect']);

  const res = await managerFetch(`/api/admin/variants/${variantId}/`, { method: 'PATCH', body: formData });
  if (!res.ok) {
    return { error: await parseError(res) };
  }
  revalidatePath(`/manage/products/${productId}/edit`);
  return { error: null };
}

export async function deleteVariantAction(variantId: string, productId: string) {
  const res = await managerFetch(`/api/admin/variants/${variantId}/`, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  revalidatePath(`/manage/products/${productId}/edit`);
}
