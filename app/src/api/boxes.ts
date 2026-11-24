import { apiClient } from './client';
import { useApiRouter } from './router';

type ApiRoute = ReturnType<typeof useApiRouter>;

export type BoxItem = {
  id: number;
  name: string;
  quantity: number;
  notes: string | null;
  /** A transparent PNG of the item cut out of its photo. */
  sticker_url: string | null;
};

export type Box = {
  /** Permanent; it is what the printed QR label points at. */
  token: string;
  name: string;
  emoji: string;
  location: string | null;
  public_url: string;
  /** Newest first. */
  items: BoxItem[];
  updated_at: string;
};

/** What a printed label needs: who the box is and its QR. */
export type BoxLabel = Pick<Box, 'token' | 'name' | 'emoji' | 'location'> & {
  qr_svg: string;
};

export type BoxWithLabel = Box & BoxLabel;

export type BoxInput = {
  name: string;
  emoji: string;
  location: string | null;
};

export type BoxItemInput = {
  name: string;
  quantity: number;
  notes: string | null;
  /** Temp key of a freshly uploaded sticker; omit to keep the current one. */
  sticker_path?: string;
  /** Token of another box to move the item into. */
  box?: string;
};

export async function fetchBoxes(route: ApiRoute): Promise<Box[]> {
  const { data } = await apiClient.get<{ data: Box[] }>(route('api.boxes.index'));

  return data.data;
}

export async function fetchBoxLabel(route: ApiRoute, token: string): Promise<BoxWithLabel> {
  const { data } = await apiClient.get<{ data: BoxWithLabel }>(
    route('api.boxes.show', { box: token }),
  );

  return data.data;
}

export async function fetchBoxLabels(route: ApiRoute, tokens: string[]): Promise<BoxLabel[]> {
  const { data } = await apiClient.get<{ data: BoxLabel[] }>(route('api.boxes.labels'), {
    params: { tokens },
  });

  return data.data;
}

export async function saveBox(route: ApiRoute, input: BoxInput, token?: string): Promise<Box> {
  const { data } = token
    ? await apiClient.patch<{ data: Box }>(route('api.boxes.update', { box: token }), input)
    : await apiClient.post<{ data: Box }>(route('api.boxes.store'), input);

  return data.data;
}

export async function deleteBox(route: ApiRoute, token: string): Promise<void> {
  await apiClient.delete(route('api.boxes.destroy', { box: token }));
}

export async function createBoxItem(
  route: ApiRoute,
  token: string,
  input: BoxItemInput,
): Promise<BoxItem> {
  const { data } = await apiClient.post<{ data: BoxItem }>(
    route('api.boxes.items.store', { box: token }),
    input,
  );

  return data.data;
}

export async function updateBoxItem(
  route: ApiRoute,
  id: number,
  input: Partial<BoxItemInput>,
): Promise<BoxItem> {
  const { data } = await apiClient.patch<{ data: BoxItem }>(
    route('api.box-items.update', { boxItem: id }),
    input,
  );

  return data.data;
}

export async function deleteBoxItem(route: ApiRoute, id: number): Promise<void> {
  await apiClient.delete(route('api.box-items.destroy', { boxItem: id }));
}

/** "3 cosas": distinct things in a box, the same count the public page shows. */
export function describeCount(box: Box): string {
  const count = box.items.length;

  return count === 0 ? 'Vacía' : count === 1 ? '1 cosa' : `${count} cosas`;
}

function normalized(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export type BoxSearchHit = {
  box: Box;
  item: BoxItem;
};

/**
 * Finds things across every box by name or note, accent- and case-blind, so
 * "arbol" finds "Árbol de Navidad".
 */
export function searchBoxes(boxes: Box[], query: string): BoxSearchHit[] {
  const needle = normalized(query);

  if (needle.length === 0) {
    return [];
  }

  return boxes.flatMap((box) =>
    box.items
      .filter((item) => normalized(`${item.name} ${item.notes ?? ''}`).includes(needle))
      .map((item) => ({ box, item })),
  );
}
